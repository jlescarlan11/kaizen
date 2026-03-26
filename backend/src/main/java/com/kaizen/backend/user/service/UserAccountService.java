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

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final OnboardingProgressService onboardingProgressService;
    private final BudgetService budgetService;
    private final UserFundingSourceService userFundingSourceService;

    public UserAccountService(
        UserAccountRepository userAccountRepository,
        OnboardingProgressService onboardingProgressService,
        BudgetService budgetService,
        UserFundingSourceService userFundingSourceService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.onboardingProgressService = onboardingProgressService;
        this.budgetService = budgetService;
        this.userFundingSourceService = userFundingSourceService;
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
        
        UserAccount updated = userAccountRepository.save(account);
        userFundingSourceService.replaceInitialSource(updated, fundingSourceType, request.startingFunds());
        
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

    private UserAccount findAccountByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private UserResponse toUserResponse(UserAccount account) {
        return new UserResponse(
            account.getId(),
            account.getName(),
            account.getEmail(),
            account.getPictureUrl(),
            account.isOnboardingCompleted(),
            account.getBalance(),
            account.isBudgetSetupSkipped(),
            account.isTourCompleted(),
            account.isFirstTransactionAdded(),
            account.getQuickAddPreferences()
        );
    }

    private UserProfileResponse toUserProfileResponse(UserAccount account) {
        return new UserProfileResponse(
            account.getId(),
            account.getName(),
            account.getEmail(),
            account.getPictureUrl(),
            account.getCreatedAt(),
            account.isOnboardingCompleted(),
            account.getBalance(),
            account.isBudgetSetupSkipped(),
            account.isTourCompleted(),
            account.isFirstTransactionAdded(),
            account.getQuickAddPreferences()
        );
    }
}
