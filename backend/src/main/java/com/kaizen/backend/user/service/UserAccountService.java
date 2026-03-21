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
        return userAccountRepository.findByEmailIgnoreCase(email)
            .map(account -> new UserResponse(
                account.getId(),
                account.getName(),
                account.getEmail(),
                account.getPictureUrl(),
                account.isOnboardingCompleted(),
            account.getOpeningBalance(),
            account.isBudgetSetupSkipped()
        ))
        .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    public UserProfileResponse getProfileByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
            .map(account -> new UserProfileResponse(
                account.getId(),
                account.getName(),
                account.getEmail(),
                account.getPictureUrl(),
                account.getCreatedAt(),
                account.isOnboardingCompleted(),
                account.getOpeningBalance(),
                account.isBudgetSetupSkipped()
            ))
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));
    }

    @Transactional
    public UserResponse completeOnboarding(String email, OnboardingRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        account.setOpeningBalance(request.openingBalance());
        account.setOnboardingCompleted(true);
        
        UserAccount updated = userAccountRepository.save(account);
        onboardingProgressService.deleteForUser(updated);
        
        return new UserResponse(
            updated.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getPictureUrl(),
            updated.isOnboardingCompleted(),
            updated.getOpeningBalance(),
            updated.isBudgetSetupSkipped()
        );
    }

    @Transactional
    public UserResponse updateBalance(String email, BalanceUpdateRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        account.setOpeningBalance(request.openingBalance());

        UserAccount updated = userAccountRepository.save(account);

        return new UserResponse(
            updated.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getPictureUrl(),
            updated.isOnboardingCompleted(),
            updated.getOpeningBalance(),
            updated.isBudgetSetupSkipped()
        );
    }

    @Transactional
    public UserResponse updateBudgetSetupSkipPreference(String email, boolean skip) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        account.setBudgetSetupSkipped(skip);

        UserAccount updated = userAccountRepository.save(account);

        return new UserResponse(
            updated.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getPictureUrl(),
            updated.isOnboardingCompleted(),
            updated.getOpeningBalance(),
            updated.isBudgetSetupSkipped()
        );
    }
}
