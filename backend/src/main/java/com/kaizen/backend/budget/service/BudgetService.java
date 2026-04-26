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
import com.kaizen.backend.budget.dto.BudgetResponse;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.budget.validation.BudgetValidationService;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserAccountRepository userAccountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;
    private final Clock clock;
    private final BudgetValidationService budgetValidationService;
    private final TransactionRepository transactionRepository;

    @Autowired
    public BudgetService(
        BudgetRepository budgetRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository,
        TransactionService transactionService,
        BudgetValidationService budgetValidationService,
        TransactionRepository transactionRepository
    ) {
        this(budgetRepository, userAccountRepository, categoryRepository, transactionService,
            Clock.systemUTC(), budgetValidationService, transactionRepository);
    }

    public BudgetService(
        BudgetRepository budgetRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository,
        TransactionService transactionService,
        Clock clock,
        BudgetValidationService budgetValidationService,
        TransactionRepository transactionRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
        this.clock = clock;
        this.budgetValidationService = budgetValidationService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public List<Budget> saveSmartBudgets(String email, BudgetBatchRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        validateBatchFits(user, request.budgets());

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

            budgets.add(new Budget(user, category, amount, createRequest.period()));
        }

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

        Long editedId = budgetRepository.findByUserIdAndCategoryId(user.getId(), category.getId())
            .map(Budget::getId)
            .orElse(null);
        BigDecimal amount = request.amount() != null ? request.amount() : BigDecimal.ZERO;
        budgetValidationService.validateAllocationFits(user, request.period(), amount, editedId);

        Budget budget = new Budget(user, category, amount, request.period());
        return budgetRepository.save(budget);
    }

    private void validateBatchFits(UserAccount user, List<BudgetCreateRequest> requests) {
        BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();

        BigDecimal totalNewCommitment = BigDecimal.ZERO;
        for (BudgetCreateRequest req : requests) {
            BigDecimal amount = req.amount() != null ? req.amount() : BigDecimal.ZERO;
            BigDecimal expectedExpense = computeExpectedExpenseForCategoryInPeriod(
                user.getId(), req.categoryId(), req.period());
            totalNewCommitment = totalNewCommitment.add(
                amount.subtract(expectedExpense).max(BigDecimal.ZERO));
        }

        if (balance.subtract(totalNewCommitment).compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal shortfall = totalNewCommitment.subtract(balance)
                .setScale(2, RoundingMode.HALF_UP);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                String.format("Batch allocation exceeds available balance by %s.", shortfall)
            );
        }
    }

    private BigDecimal computeExpectedExpenseForCategoryInPeriod(
            Long userId, Long categoryId, BudgetPeriod period) {
        LocalDate now = LocalDate.now(clock);
        OffsetDateTime start;
        OffsetDateTime end;
        if (period == BudgetPeriod.MONTHLY) {
            start = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().atOffset(ZoneOffset.UTC);
            end = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
        } else {
            start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().atOffset(ZoneOffset.UTC);
            end = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
        }
        BigDecimal sum = transactionRepository.sumAmountByCategoryIdAndTypeAndDateRange(
            userId, categoryId, TransactionType.EXPENSE, start, end);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    @Transactional
    public List<Budget> saveBudgetsForUser(UserAccount user, List<BudgetCreateRequest> budgetRequests) {
        if (budgetRequests == null || budgetRequests.isEmpty()) {
            return List.of();
        }

        validateBatchFits(user, budgetRequests);

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
            budgets.add(new Budget(user, category, amount, createRequest.period()));
        }

        return budgetRepository.saveAll(budgets);
    }

    public List<BudgetResponse> getBudgetsWithProjections(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        List<Budget> budgets = budgetRepository.findAllByUserId(user.getId());
        
        LocalDate now = LocalDate.now(clock);
        int daysElapsed = now.getDayOfMonth();
        YearMonth yearMonth = YearMonth.from(now);
        int totalDaysInMonth = yearMonth.lengthOfMonth();
        int daysLeft = Math.max(0, totalDaysInMonth - daysElapsed);

        return budgets.stream()
            .map(budget -> calculateProjections(budget, daysElapsed, daysLeft, totalDaysInMonth))
            .collect(Collectors.toList());
    }

    private BudgetResponse calculateProjections(Budget budget, int daysElapsed, int daysLeft, int totalDaysInMonth) {
        BigDecimal burnRate = null;
        BigDecimal dailyAllowance = null;
        BigDecimal projectedTotal = null;

        if (daysElapsed >= 3) {
            BigDecimal spent = budget.getExpense() != null ? budget.getExpense() : BigDecimal.ZERO;
            BigDecimal limit = budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO;
            BigDecimal remaining = limit.subtract(spent);

            burnRate = spent.divide(BigDecimal.valueOf(daysElapsed), 2, RoundingMode.HALF_UP);
            
            if (daysLeft > 0) {
                dailyAllowance = remaining.divide(BigDecimal.valueOf(daysLeft), 2, RoundingMode.HALF_UP);
            } else {
                dailyAllowance = BigDecimal.ZERO;
            }

            projectedTotal = burnRate.multiply(BigDecimal.valueOf(totalDaysInMonth)).setScale(2, RoundingMode.HALF_UP);
        }

        return new BudgetResponse(
            budget.getId(),
            budget.getUser().getId(),
            budget.getCategory().getId(),
            budget.getCategory().getName(),
            budget.getAmount(),
            budget.getExpense(),
            burnRate,
            dailyAllowance,
            projectedTotal,
            daysElapsed,
            daysLeft,
            budget.getPeriod(),
            budget.getCreatedAt(),
            budget.getUpdatedAt()
        );
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
        budgetRepository.deleteByUserId(user.getId());
    }

    private BudgetSummaryResponse buildBudgetSummary(UserAccount user, List<Budget> budgets) {
        BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();

        BigDecimal totalAllocated = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal outstandingCommitments = BigDecimal.ZERO;

        for (Budget b : budgets) {
            BigDecimal amount = b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO;
            BigDecimal expense = b.getExpense() != null ? b.getExpense() : BigDecimal.ZERO;
            totalAllocated = totalAllocated.add(amount);
            totalSpent = totalSpent.add(expense);
            outstandingCommitments = outstandingCommitments
                .add(amount.subtract(expense).max(BigDecimal.ZERO));
        }

        BigDecimal unallocated = balance.subtract(outstandingCommitments);

        int allocationPercentage = balance.compareTo(BigDecimal.ZERO) > 0
            ? totalAllocated.multiply(BigDecimal.valueOf(100))
                .divide(balance, 0, RoundingMode.HALF_UP).intValue()
            : 0;

        return new BudgetSummaryResponse(
            balance, totalAllocated, totalSpent, unallocated, allocationPercentage, budgets.size()
        );
    }

}
