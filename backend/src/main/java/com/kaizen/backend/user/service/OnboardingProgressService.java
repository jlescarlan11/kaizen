package com.kaizen.backend.user.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.dto.OnboardingProgressUpdateRequest;
import com.kaizen.backend.user.entity.FundingSourceType;
import com.kaizen.backend.user.entity.OnboardingProgress;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.OnboardingProgressRepository;

@Service
// Durable server-side storage ensures cross-device resume (PRD Section 6c, Story 17).
public class OnboardingProgressService {

    private final OnboardingProgressRepository onboardingProgressRepository;

    public OnboardingProgressService(OnboardingProgressRepository onboardingProgressRepository) {
        this.onboardingProgressRepository = onboardingProgressRepository;
    }

    @Transactional(readOnly = true)
    public Optional<OnboardingProgress> findForUser(UserAccount userAccount) {
        return onboardingProgressRepository.findByUserAccountId(userAccount.getId())
            .map(progress -> {
                // Force initialization of lazy collection
                if (progress.getInitialBalances() != null) {
                    progress.getInitialBalances().size();
                }
                return progress;
            });
    }

    @Transactional
    public OnboardingProgress upsert(
        UserAccount userAccount,
        OnboardingProgressUpdateRequest request,
        FundingSourceType fundingSourceType
    ) {
        OnboardingProgress progress = onboardingProgressRepository
            .findByUserAccountId(userAccount.getId())
            .orElseGet(() -> new OnboardingProgress(userAccount));

        progress.setCurrentStep(request.currentStep());
        if (request.startingFunds() != null) {
            progress.setStartingFunds(request.startingFunds());
            // PRD Open Question 2: Sync balance to UserAccount early so BudgetValidationService 
            // has the required context for manual/smart allocation checks.
            userAccount.setBalance(request.startingFunds());
        }
        if (fundingSourceType != null) {
            progress.setFundingSourceType(fundingSourceType);
        }

        if (request.description() != null) {
            progress.setInitialTransactionDescription(request.description());
        }
        if (request.notes() != null) {
            progress.setInitialTransactionNotes(request.notes());
        }
        if (request.paymentMethodId() != null) {
            progress.setInitialTransactionPaymentMethodId(request.paymentMethodId());
        }
        if (request.transactionDate() != null) {
            progress.setInitialTransactionDate(request.transactionDate());
        }

        if (request.initialBalances() != null) {
            progress.getInitialBalances().clear();
            List<OnboardingProgress.OnboardingInitialBalance> initialBalances = request.initialBalances().stream()
                .map(b -> new OnboardingProgress.OnboardingInitialBalance(
                    b.paymentMethodId(),
                    b.amount(),
                    b.description(),
                    b.notes(),
                    b.transactionDate()
                ))
                .collect(java.util.stream.Collectors.toList());
            progress.getInitialBalances().addAll(initialBalances);

            // Update user account balance based on sum of initial balances
            BigDecimal total = initialBalances.stream()
                .map(OnboardingProgress.OnboardingInitialBalance::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            userAccount.setBalance(total);
        }

        return onboardingProgressRepository.save(progress);
    }

    @Transactional
    public void deleteForUser(UserAccount userAccount) {
        onboardingProgressRepository.findByUserAccountId(userAccount.getId())
            .ifPresent(onboardingProgressRepository::delete);
        // The logout flow (Instruction 5) must delete the record immediately,
        // whereas close-and-resume simply leaves it intact for rehydration (PRD Open Question 6).
    }
}
