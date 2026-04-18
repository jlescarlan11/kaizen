package com.kaizen.backend.budget.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kaizen.backend.budget.dto.BudgetBatchRequest;
import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserAccountRepository userAccountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;

    public BudgetService(
        BudgetRepository budgetRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository,
        TransactionService transactionService
    ) {
        this.budgetRepository = budgetRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
    }

    @Transactional
    public List<Budget> saveSmartBudgets(String email, BudgetBatchRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        // Refund existing budget amounts back to pools before clearing
        List<Budget> existingBudgets = budgetRepository.findAllByUserId(user.getId());
        for (Budget budget : existingBudgets) {
            refundToPool(user, budget.getPeriod(), budget.getAmount());
        }

        // Clear existing budgets for batch replacement
        budgetRepository.deleteByUserId(user.getId());

        List<Budget> budgets = new ArrayList<>(request.budgets().size());
        for (BudgetCreateRequest createRequest : request.budgets()) {
            Category category = categoryRepository.findById(createRequest.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
            if (!category.isGlobal() && (category.getUser() == null || !user.getId().equals(category.getUser().getId()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not available for this user.");
            }

            BigDecimal amount = createRequest.amount() != null ? createRequest.amount() : BigDecimal.ZERO;
            deductFromPool(user, createRequest.period(), amount);
            
            budgets.add(new Budget(user, category, amount, createRequest.period()));
        }

        userAccountRepository.save(user);
        return budgetRepository.saveAll(budgets);
    }

    @Transactional
    public Budget saveBudget(String email, BudgetCreateRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
        if (!category.isGlobal() && (category.getUser() == null || !category.getUser().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not available for this user.");
        }

        // Handle update: refund old amount if category already has a budget
        budgetRepository.findByUserIdAndCategoryId(user.getId(), category.getId())
            .ifPresent(existing -> refundToPool(user, existing.getPeriod(), existing.getAmount()));

        BigDecimal amount = request.amount() != null ? request.amount() : BigDecimal.ZERO;
        deductFromPool(user, request.period(), amount);

        Budget budget = new Budget(user, category, amount, request.period());
        userAccountRepository.save(user);
        return budgetRepository.save(budget);
    }

    private void refundToPool(UserAccount user, BudgetPeriod period, BigDecimal amount) {
        if (period == BudgetPeriod.MONTHLY) {
            user.setAvailableMonthly(user.getAvailableMonthly().add(amount));
        } else {
            user.setAvailableWeekly(user.getAvailableWeekly().add(amount));
        }
    }

    private void deductFromPool(UserAccount user, BudgetPeriod period, BigDecimal amount) {
        if (period == BudgetPeriod.MONTHLY) {
            user.setAvailableMonthly(user.getAvailableMonthly().subtract(amount));
        } else {
            user.setAvailableWeekly(user.getAvailableWeekly().subtract(amount));
        }
    }

    @Transactional
    public List<Budget> saveBudgetsForUser(UserAccount user, List<BudgetCreateRequest> budgetRequests) {
        if (budgetRequests == null || budgetRequests.isEmpty()) {
            return List.of();
        }

        // Refund existing budget amounts back to pools
        List<Budget> existingBudgets = budgetRepository.findAllByUserId(user.getId());
        for (Budget budget : existingBudgets) {
            refundToPool(user, budget.getPeriod(), budget.getAmount());
        }

        // Clear existing budgets
        budgetRepository.deleteByUserId(user.getId());

        List<Budget> budgets = new ArrayList<>(budgetRequests.size());
        for (BudgetCreateRequest createRequest : budgetRequests) {
            Category category = categoryRepository.findById(createRequest.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
            if (!category.isGlobal() && (category.getUser() == null || !category.getUser().getId().equals(user.getId()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not available for this user.");
            }

            BigDecimal amount = createRequest.amount() != null ? createRequest.amount() : BigDecimal.ZERO;
            deductFromPool(user, createRequest.period(), amount);
            budgets.add(new Budget(user, category, amount, createRequest.period()));
        }

        userAccountRepository.save(user);
        return budgetRepository.saveAll(budgets);
    }

    public List<Budget> getBudgetsForUser(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        return budgetRepository.findAllByUserId(user.getId());
    }

    public long countBudgetsForUser(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        return budgetRepository.countByUserId(user.getId());
    }

    public BudgetSummaryResponse getBudgetSummaryForUser(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        return buildBudgetSummary(user, budgetRepository.findAllByUserId(user.getId()));
    }

    @Transactional
    public void deleteAllBudgetsForUser(UserAccount user) {
        // Refund before deleting
        List<Budget> existingBudgets = budgetRepository.findAllByUserId(user.getId());
        for (Budget budget : existingBudgets) {
            refundToPool(user, budget.getPeriod(), budget.getAmount());
        }
        userAccountRepository.save(user);
        budgetRepository.deleteByUserId(user.getId());
    }

    private BudgetSummaryResponse buildBudgetSummary(UserAccount user, List<Budget> budgets) {
        BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();
        BigDecimal availableMonthly = user.getAvailableMonthly() == null ? BigDecimal.ZERO : user.getAvailableMonthly();
        BigDecimal availableWeekly = user.getAvailableWeekly() == null ? BigDecimal.ZERO : user.getAvailableWeekly();

        BigDecimal totalAllocated = budgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = budgets.stream()
            .map(Budget::getExpense)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal remainingToAllocate = availableMonthly.add(availableWeekly);
        BigDecimal totalCapacity = totalAllocated.add(remainingToAllocate);
        
        int allocationPercentage = totalCapacity.compareTo(BigDecimal.ZERO) > 0
            ? totalAllocated
                .multiply(BigDecimal.valueOf(100))
                .divide(totalCapacity, 0, RoundingMode.HALF_UP)
                .intValue()
            : 0;

        return new BudgetSummaryResponse(
            balance,
            availableMonthly,
            availableWeekly,
            totalAllocated,
            totalSpent,
            remainingToAllocate,
            allocationPercentage,
            budgets.size()
        );
    }

    @Transactional
    public void transferFunds(String email, BudgetPeriod source, BudgetPeriod target, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer amount must be positive.");
        }
        if (source == target) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source and target periods must be different.");
        }

        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        if (source == BudgetPeriod.MONTHLY) {
            if (user.getAvailableMonthly().compareTo(amount) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient funds in monthly pool.");
            }
            user.setAvailableMonthly(user.getAvailableMonthly().subtract(amount));
            user.setAvailableWeekly(user.getAvailableWeekly().add(amount));
        } else {
            if (user.getAvailableWeekly().compareTo(amount) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient funds in weekly pool.");
            }
            user.setAvailableWeekly(user.getAvailableWeekly().subtract(amount));
            user.setAvailableMonthly(user.getAvailableMonthly().add(amount));
        }

        try {
            userAccountRepository.save(user);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The account was updated by another process. Please try again.");
        }
    }

    @Transactional
    public void processRollover(UserAccount user, BudgetPeriod period) {
        BigDecimal currentPoolBalance = (period == BudgetPeriod.MONTHLY) 
            ? (user.getAvailableMonthly() != null ? user.getAvailableMonthly() : BigDecimal.ZERO)
            : (user.getAvailableWeekly() != null ? user.getAvailableWeekly() : BigDecimal.ZERO);

        List<Budget> budgets = budgetRepository.findAllByUserIdAndPeriod(user.getId(), period);
        BigDecimal totalAllocated = budgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = budgets.stream()
            .map(Budget::getExpense)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal netRollover = totalAllocated.subtract(totalSpent);
        BigDecimal newAvailable = currentPoolBalance.add(netRollover);
        
        if (period == BudgetPeriod.MONTHLY) {
            user.setAvailableMonthly(newAvailable.max(BigDecimal.ZERO));
        } else {
            user.setAvailableWeekly(newAvailable.max(BigDecimal.ZERO));
        }
        
        // Reset budget expenses for the new period will happen automatically via 
        // TransactionService.recalculateBudgetExpenses because it uses date-range filtering.
        // But we might want to explicitly set them to zero here for clarity in the entity.
        for (Budget budget : budgets) {
            budget.setExpense(BigDecimal.ZERO);
        }
        budgetRepository.saveAll(budgets);
        userAccountRepository.save(user);
    }

    @Transactional
    public void processInitialInjection(UserAccount user) {
        if (!user.isInitialInjectionProcessed()) {
            BigDecimal balance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
            user.setAvailableMonthly(user.getAvailableMonthly().add(balance));
            user.setInitialInjectionProcessed(true);
            userAccountRepository.save(user);
        }
    }
}
