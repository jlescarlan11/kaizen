package com.kaizen.backend.budget.validation;

import com.kaizen.backend.budget.dto.BudgetBatchRequest;
import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.constants.ValidationConstants;
import com.kaizen.backend.common.dto.ValidationError;
import com.kaizen.backend.common.exception.ValidationException;
import com.kaizen.backend.config.ValidationProperties;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class BudgetValidationService {

    private final ValidationProperties validationProperties;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserAccountRepository userAccountRepository;

    public BudgetValidationService(
        ValidationProperties validationProperties,
        BudgetRepository budgetRepository,
        CategoryRepository categoryRepository,
        UserAccountRepository userAccountRepository
    ) {
        this.validationProperties = validationProperties;
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public void validateSmartBudgets(String email, BudgetBatchRequest request) {
        UserAccount user = findUser(email);
        validateBudgets(user, request.budgets(), "budgets");
    }

    public void validateSingleBudget(String email, BudgetCreateRequest request) {
        UserAccount user = findUser(email);
        validateSingleBudget(user, request);
    }

    public void validateAllocationFits(UserAccount user, BudgetPeriod period,
                                        BigDecimal newAmount, Long budgetIdBeingEdited) {
        BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();
        List<Budget> budgets = budgetRepository.findAllByUserId(user.getId());

        BigDecimal outstandingExcludingThis = BigDecimal.ZERO;
        BigDecimal thisExpense = BigDecimal.ZERO;

        for (Budget b : budgets) {
            BigDecimal amount = b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO;
            BigDecimal expense = b.getExpense() != null ? b.getExpense() : BigDecimal.ZERO;
            if (budgetIdBeingEdited != null && b.getId().equals(budgetIdBeingEdited)) {
                thisExpense = expense;
                continue;
            }
            outstandingExcludingThis = outstandingExcludingThis
                .add(amount.subtract(expense).max(BigDecimal.ZERO));
        }

        BigDecimal newCommitment = newAmount.subtract(thisExpense).max(BigDecimal.ZERO);
        BigDecimal projectedUnallocated = balance
            .subtract(outstandingExcludingThis)
            .subtract(newCommitment);

        if (projectedUnallocated.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                String.format("Allocation exceeds available balance by %s.",
                    projectedUnallocated.abs())
            );
        }
    }

    private UserAccount findUser(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));
    }

    private void validateBudgets(UserAccount user, List<BudgetCreateRequest> budgets, String fieldBase) {
        List<ValidationError> errors = new ArrayList<>();
        BigDecimal availableMonthly = user.getAvailableMonthly() == null ? BigDecimal.ZERO : user.getAvailableMonthly();
        BigDecimal availableWeekly = user.getAvailableWeekly() == null ? BigDecimal.ZERO : user.getAvailableWeekly();

        for (int i = 0; i < budgets.size(); i++) {
            BudgetCreateRequest budget = budgets.get(i);
            String entryPrefix = String.format("%s[%d]", fieldBase, i);
            BigDecimal poolBalance = budget.period() == com.kaizen.backend.budget.entity.BudgetPeriod.MONTHLY ? availableMonthly : availableWeekly;

            if (budget.amount() != null) {
                if (budget.amount().compareTo(BigDecimal.ZERO) <= 0) {
                    errors.add(new ValidationError(entryPrefix + ".amount", ValidationConstants.BUDGET_AMOUNT_POSITIVE_ERROR));
                }
                if (validationProperties.isBudgetBalanceConstraintEnabled()
                    && budget.amount().compareTo(poolBalance) > 0) {
                    errors.add(new ValidationError(entryPrefix + ".amount", ValidationConstants.BUDGET_OVER_BALANCE_ERROR));
                }
            }
        }

        if (validationProperties.isBudgetBalanceConstraintEnabled()) {
            Map<com.kaizen.backend.budget.entity.BudgetPeriod, BigDecimal> totals = budgets.stream()
                .filter(b -> b.amount() != null && b.period() != null)
                .collect(Collectors.groupingBy(
                    BudgetCreateRequest::period,
                    Collectors.reducing(BigDecimal.ZERO, BudgetCreateRequest::amount, BigDecimal::add)
                ));

            totals.forEach((period, total) -> {
                BigDecimal poolBalance = period == com.kaizen.backend.budget.entity.BudgetPeriod.MONTHLY ? availableMonthly : availableWeekly;
                if (total.compareTo(poolBalance) > 0) {
                    errors.add(new ValidationError(fieldBase + "." + period.name().toLowerCase() + "Total", ValidationConstants.BUDGET_TOTAL_OVER_BALANCE_ERROR));
                }
            });
        }

        addDuplicateCategoryErrors(errors, budgets, fieldBase);
        addCategoryExistenceErrors(errors, budgets, user, fieldBase);

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    private void validateSingleBudget(UserAccount user, BudgetCreateRequest budget) {
        List<ValidationError> errors = new ArrayList<>();
        BigDecimal poolBalance = budget.period() == com.kaizen.backend.budget.entity.BudgetPeriod.MONTHLY 
            ? (user.getAvailableMonthly() == null ? BigDecimal.ZERO : user.getAvailableMonthly())
            : (user.getAvailableWeekly() == null ? BigDecimal.ZERO : user.getAvailableWeekly());

        List<Budget> existingBudgets = budgetRepository.findAllByUserIdAndPeriod(user.getId(), budget.period());
        BigDecimal existingAllocated = existingBudgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingInPool = poolBalance.subtract(existingAllocated).max(BigDecimal.ZERO);

        if (budget.amount() != null) {
            if (budget.amount().compareTo(BigDecimal.ZERO) <= 0) {
                errors.add(new ValidationError("budget.amount", ValidationConstants.BUDGET_AMOUNT_POSITIVE_ERROR));
            }
            if (validationProperties.isBudgetBalanceConstraintEnabled()
                && budget.amount().compareTo(remainingInPool) > 0) {
                errors.add(new ValidationError("budget.amount", ValidationConstants.BUDGET_OVER_BALANCE_ERROR));
            }
            if (validationProperties.isBudgetBalanceConstraintEnabled()
                && existingAllocated.add(budget.amount()).compareTo(poolBalance) > 0) {
                errors.add(new ValidationError("budget.total", ValidationConstants.BUDGET_TOTAL_OVER_BALANCE_ERROR));
            }
        }

        if (budget.categoryId() != null
            && budgetRepository.existsByUserIdAndCategoryId(user.getId(), budget.categoryId())) {
            errors.add(new ValidationError("budget.categoryId", ValidationConstants.DUPLICATE_CATEGORY_ERROR));
        }

        addCategoryExistenceErrors(errors, List.of(budget), user, "budget");

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    private void addDuplicateCategoryErrors(List<ValidationError> errors, List<BudgetCreateRequest> budgets, String fieldBase) {
        Map<Long, List<Integer>> positions = new HashMap<>();
        for (int i = 0; i < budgets.size(); i++) {
            BudgetCreateRequest budget = budgets.get(i);
            Long categoryId = budget.categoryId();
            if (categoryId != null) {
                positions.computeIfAbsent(categoryId, key -> new ArrayList<>()).add(i);
            }
        }

        for (Map.Entry<Long, List<Integer>> entry : positions.entrySet()) {
            List<Integer> indexes = entry.getValue();
            if (indexes.size() <= 1) {
                continue;
            }
            for (Integer index : indexes) {
                String field = String.format("%s[%d].categoryId", fieldBase, index);
                errors.add(new ValidationError(field, ValidationConstants.DUPLICATE_CATEGORY_ERROR));
            }
        }
    }

    private void addCategoryExistenceErrors(List<ValidationError> errors, List<BudgetCreateRequest> budgets, UserAccount user, String fieldBase) {
        List<Long> categoryIds = budgets.stream()
            .map(BudgetCreateRequest::categoryId)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

        if (categoryIds.isEmpty()) {
            return;
        }

        List<Category> accessible = categoryRepository.findAccessibleByIds(categoryIds, user.getId());
        Set<Long> accessibleIds = accessible.stream()
            .map(Category::getId)
            .collect(Collectors.toSet());

        for (int i = 0; i < budgets.size(); i++) {
            BudgetCreateRequest budget = budgets.get(i);
            Long categoryId = budget.categoryId();
            if (categoryId != null && !accessibleIds.contains(categoryId)) {
                errors.add(new ValidationError(String.format("%s[%d].categoryId", fieldBase, i), ValidationConstants.CATEGORY_NOT_FOUND_ERROR));
            }
        }
    }
}
