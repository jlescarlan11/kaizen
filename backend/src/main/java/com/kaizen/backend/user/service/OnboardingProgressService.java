package com.kaizen.backend.user.service;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.entity.FundingSourceType;
import com.kaizen.backend.user.entity.OnboardingProgress;
import com.kaizen.backend.user.entity.OnboardingStep;
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
        return onboardingProgressRepository.findByUserAccountId(userAccount.getId());
    }

    @Transactional
    public OnboardingProgress upsert(
        UserAccount userAccount,
        OnboardingStep step,
        BigDecimal startingFunds,
        FundingSourceType fundingSourceType
    ) {
        OnboardingProgress progress = onboardingProgressRepository
            .findByUserAccountId(userAccount.getId())
            .orElseGet(() -> new OnboardingProgress(userAccount));

        progress.setCurrentStep(step);
        if (startingFunds != null) {
            progress.setStartingFunds(startingFunds);
            // PRD Open Question 2: Sync balance to UserAccount early so BudgetValidationService 
            // has the required context for manual/smart allocation checks.
            userAccount.setBalance(startingFunds);
        }
        if (fundingSourceType != null) {
            progress.setFundingSourceType(fundingSourceType);
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
