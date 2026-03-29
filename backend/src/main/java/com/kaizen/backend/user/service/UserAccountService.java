package com.kaizen.backend.user.service;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.dto.OnboardingRequest;
import com.kaizen.backend.user.dto.UserProfileResponse;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.entity.FundingSourceType;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import com.kaizen.backend.budget.service.BudgetService;
import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.common.entity.TransactionType;
import java.time.LocalDateTime;

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final OnboardingProgressService onboardingProgressService;
    private final BudgetService budgetService;
    private final UserFundingSourceService userFundingSourceService;
    private final TransactionRepository transactionRepository;

    public UserAccountService(
        UserAccountRepository userAccountRepository,
        OnboardingProgressService onboardingProgressService,
        BudgetService budgetService,
        UserFundingSourceService userFundingSourceService,
        TransactionRepository transactionRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.onboardingProgressService = onboardingProgressService;
        this.budgetService = budgetService;
        this.userFundingSourceService = userFundingSourceService;
        this.transactionRepository = transactionRepository;
    }

    public UserResponse getByEmail(String email) {
        UserAccount account = findAccountByEmail(email);
        return toUserResponse(account);
    }

    public UserProfileResponse getProfileByEmail(String email) {
        UserAccount account = findAccountByEmail(email);
        return toUserProfileResponse(account);
    }

    @Transactional
    public UserResponse completeOnboarding(String email, OnboardingRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        FundingSourceType fundingSourceType = FundingSourceType.fromValue(request.fundingSourceType())
            .orElseThrow(() -> new IllegalArgumentException("Unsupported funding source type"));

        account.setBalance(request.startingFunds());
        account.setOnboardingCompleted(true);
        account.setFirstTransactionAdded(true);
        
        UserAccount updated = userAccountRepository.save(account);
        userFundingSourceService.replaceInitialSource(updated, fundingSourceType, request.startingFunds());
        
        // Create initial transaction for opening balance
        Transaction openingTransaction = new Transaction(
            updated,
            null, // No category for opening balance
            null, // No specific payment method yet
            request.startingFunds(),
            TransactionType.INCOME,
            "Opening Balance",
            LocalDateTime.now(),
            null,
            "Automatically created during onboarding"
        );
        transactionRepository.save(openingTransaction);

        if (request.budgets() != null && !request.budgets().isEmpty()) {
            budgetService.saveBudgetsForUser(updated, request.budgets());
        }
        
        onboardingProgressService.deleteForUser(updated);
        
        return toUserResponse(updated);
    }

    @Transactional
    public UserResponse updateBudgetSetupSkipPreference(String email, boolean skip) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        account.setBudgetSetupSkipped(skip);

        UserAccount updated = userAccountRepository.save(account);

        return toUserResponse(updated);
    }

    @Transactional
    public UserResponse markTourCompleted(String email) {
        UserAccount account = findAccountByEmail(email);
        if (!account.isTourCompleted()) {
            account.setTourCompleted(true);
            account = userAccountRepository.save(account);
        }

        return toUserResponse(account);
    }

    @Transactional
    public UserResponse resetTourFlag(String email) {
        UserAccount account = findAccountByEmail(email);
        if (account.isTourCompleted()) {
            account.setTourCompleted(false);
            account = userAccountRepository.save(account);
        }

        return toUserResponse(account);
    }

    @Transactional
    public UserResponse markFirstTransactionAdded(String email) {
        UserAccount account = findAccountByEmail(email);
        if (!account.isFirstTransactionAdded()) {
            account.setFirstTransactionAdded(true);
            account = userAccountRepository.save(account);
        }

        return toUserResponse(account);
    }

    @Transactional
    public UserResponse resetOnboarding(String email) {
        UserAccount account = findAccountByEmail(email);
        
        // 1. Delete all budgets
        budgetService.deleteAllBudgetsForUser(account);
        
        // 2. Delete onboarding progress if exists
        onboardingProgressService.deleteForUser(account);

        // 2a. Delete persisted funding sources
        userFundingSourceService.deleteAllForUser(account);
        
        // 3. Reset user account flags
        account.setBalance(BigDecimal.ZERO);
        account.setOnboardingCompleted(false);
        account.setBudgetSetupSkipped(false);
        account.setTourCompleted(false);
        account.setFirstTransactionAdded(false);
        
        UserAccount updated = userAccountRepository.save(account);
        
        return toUserResponse(updated);
    }

    @Transactional
    public UserResponse toggleReminders(String email, boolean enabled) {
        UserAccount account = findAccountByEmail(email);
        account.setRemindersEnabled(enabled);
        UserAccount updated = userAccountRepository.save(account);
        return toUserResponse(updated);
    }

    private UserAccount findAccountByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private UserResponse toUserResponse(UserAccount account) {
        return UserResponse.builder()
            .id(account.getId())
            .name(account.getName())
            .email(account.getEmail())
            .picture(account.getPictureUrl())
            .onboardingCompleted(account.isOnboardingCompleted())
            .balance(account.getBalance())
            .budgetSetupSkipped(account.isBudgetSetupSkipped())
            .tourCompleted(account.isTourCompleted())
            .firstTransactionAdded(account.isFirstTransactionAdded())
            .quickAddPreferences(account.getQuickAddPreferences())
            .remindersEnabled(account.getRemindersEnabled())
            .build();
    }

    private UserProfileResponse toUserProfileResponse(UserAccount account) {
        return UserProfileResponse.builder()
            .id(account.getId())
            .name(account.getName())
            .email(account.getEmail())
            .picture(account.getPictureUrl())
            .createdAt(account.getCreatedAt())
            .onboardingCompleted(account.isOnboardingCompleted())
            .balance(account.getBalance())
            .budgetSetupSkipped(account.isBudgetSetupSkipped())
            .tourCompleted(account.isTourCompleted())
            .firstTransactionAdded(account.isFirstTransactionAdded())
            .quickAddPreferences(account.getQuickAddPreferences())
            .remindersEnabled(account.getRemindersEnabled())
            .build();
    }
}
