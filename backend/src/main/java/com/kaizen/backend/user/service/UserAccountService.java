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
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.common.entity.TransactionType;
import java.time.OffsetDateTime;

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final OnboardingProgressService onboardingProgressService;
    private final BudgetService budgetService;
    private final UserFundingSourceService userFundingSourceService;
    private final TransactionRepository transactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final CategoryRepository categoryRepository;

    public UserAccountService(
        UserAccountRepository userAccountRepository,
        OnboardingProgressService onboardingProgressService,
        BudgetService budgetService,
        UserFundingSourceService userFundingSourceService,
        TransactionRepository transactionRepository,
        PaymentMethodRepository paymentMethodRepository,
        CategoryRepository categoryRepository
    ) {
        this.userAccountRepository = userAccountRepository;
        this.onboardingProgressService = onboardingProgressService;
        this.budgetService = budgetService;
        this.userFundingSourceService = userFundingSourceService;
        this.transactionRepository = transactionRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.categoryRepository = categoryRepository;
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

        BigDecimal totalBalance = BigDecimal.ZERO;
        if (request.initialBalances() != null && !request.initialBalances().isEmpty()) {
            totalBalance = request.initialBalances().stream()
                .map(OnboardingRequest.InitialBalanceRequest::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else if (request.startingFunds() != null) {
            totalBalance = request.startingFunds();
        }

        account.setBalance(totalBalance);
        account.setOnboardingCompleted(true);
        account.setFirstTransactionAdded(true);
        
        UserAccount updated = userAccountRepository.save(account);

        // Handle legacy single funding source if provided
        if (request.fundingSourceType() != null && request.startingFunds() != null) {
            FundingSourceType fundingSourceType = FundingSourceType.fromValue(request.fundingSourceType())
                .orElse(FundingSourceType.CASH_ON_HAND);
            userFundingSourceService.replaceInitialSource(updated, fundingSourceType, request.startingFunds());
        }
        
        // Look up the global "Initial Balance" category once for all onboarding transactions
        com.kaizen.backend.category.entity.Category initialBalanceCategory = categoryRepository
            .findByNameIgnoreCaseAndGlobalTrue("Initial Balance")
            .orElseThrow(() -> new IllegalStateException("Global 'Initial Balance' category not found. Ensure V2 migration has been applied."));

        // Create initial transactions
        if (request.initialBalances() != null && !request.initialBalances().isEmpty()) {
            for (OnboardingRequest.InitialBalanceRequest balanceRequest : request.initialBalances()) {
                PaymentMethod paymentMethod = null;
                if (balanceRequest.paymentMethodId() != null) {
                    paymentMethod = paymentMethodRepository.findById(balanceRequest.paymentMethodId()).orElse(null);
                }

                Transaction transaction = new Transaction(
                    updated,
                    initialBalanceCategory,
                    paymentMethod,
                    balanceRequest.amount(),
                    TransactionType.INCOME,
                    balanceRequest.description() != null ? balanceRequest.description() : "Opening Balance",
                    balanceRequest.transactionDate() != null ? balanceRequest.transactionDate() : OffsetDateTime.now(),
                    balanceRequest.notes() != null ? balanceRequest.notes() : "Initial setup"
                );
                transactionRepository.save(transaction);
            }
        } else if (request.startingFunds() != null) {
            // Handle legacy single transaction
            PaymentMethod paymentMethod = null;
            if (request.paymentMethodId() != null) {
                paymentMethod = paymentMethodRepository.findById(request.paymentMethodId()).orElse(null);
            }

            Transaction openingTransaction = new Transaction(
                updated,
                initialBalanceCategory,
                paymentMethod,
                request.startingFunds(),
                TransactionType.INCOME,
                request.description() != null ? request.description() : "Opening Balance",
                request.transactionDate() != null ? request.transactionDate() : OffsetDateTime.now(),
                request.notes() != null ? request.notes() : "Initial setup"
            );
            transactionRepository.save(openingTransaction);
        }

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

        // 2b. Delete transactions, categories, and payment methods
        transactionRepository.deleteByUserAccountId(account.getId());
        categoryRepository.deleteByUserId(account.getId());
        paymentMethodRepository.deleteByUserAccountId(account.getId());
        
        // 3. Reset user account fields
        account.setBalance(BigDecimal.ZERO);
        account.setOnboardingCompleted(false);
        account.setBudgetSetupSkipped(false);
        account.setTourCompleted(false);
        account.setFirstTransactionAdded(false);
        account.setQuickAddPreferences(null);
        account.setRemindersEnabled(true);
        
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
        if (account.isOnboardingCompleted()) {
            BigDecimal calculatedBalance = transactionRepository.calculateNetTransactionAmount(account.getId())
                .orElse(BigDecimal.ZERO);
            account.setBalance(calculatedBalance);
        }

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
        if (account.isOnboardingCompleted()) {
            BigDecimal calculatedBalance = transactionRepository.calculateNetTransactionAmount(account.getId())
                .orElse(BigDecimal.ZERO);
            account.setBalance(calculatedBalance);
        }

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
