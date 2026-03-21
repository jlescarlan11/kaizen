package com.kaizen.backend.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.user.dto.BalanceUpdateRequest;
import com.kaizen.backend.user.dto.OnboardingRequest;
import com.kaizen.backend.user.dto.UserProfileResponse;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final OnboardingProgressService onboardingProgressService;

    public UserAccountService(
        UserAccountRepository userAccountRepository,
        OnboardingProgressService onboardingProgressService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.onboardingProgressService = onboardingProgressService;
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

        account.setOpeningBalance(request.openingBalance());
        account.setOnboardingCompleted(true);
        
        UserAccount updated = userAccountRepository.save(account);
        onboardingProgressService.deleteForUser(updated);
        
        return toUserResponse(updated);
    }

    @Transactional
    public UserResponse updateBalance(String email, BalanceUpdateRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        account.setOpeningBalance(request.openingBalance());

        UserAccount updated = userAccountRepository.save(account);

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
            account.getOpeningBalance(),
            account.isBudgetSetupSkipped(),
            account.isTourCompleted(),
            account.isFirstTransactionAdded()
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
            account.getOpeningBalance(),
            account.isBudgetSetupSkipped(),
            account.isTourCompleted(),
            account.isFirstTransactionAdded()
        );
    }
}
