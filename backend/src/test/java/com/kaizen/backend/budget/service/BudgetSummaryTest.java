package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.budget.validation.BudgetValidationService;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BudgetSummaryTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private TransactionService transactionService;
    @Mock private BudgetValidationService budgetValidationService;
    @Mock private TransactionRepository transactionRepository;

    private BudgetService budgetService;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-04-23T00:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(
            budgetRepository, userAccountRepository, categoryRepository, transactionService, clock,
            budgetValidationService, transactionRepository
        );
        user = new UserAccount("Test", "test@example.com", "LOCAL", "1", null, null, "tok", null);
        user.setId(1L);
    }

    private Budget budget(BigDecimal amount, BigDecimal expense) {
        Budget b = new Budget(user, null, amount, BudgetPeriod.MONTHLY);
        b.setExpense(expense);
        return b;
    }

    private BudgetSummaryResponse summarize(BigDecimal balance, List<Budget> budgets) {
        user.setBalance(balance);
        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(budgets);
        return budgetService.getBudgetSummaryForUser("test@example.com");
    }

    @Test
    void noBudgets_unallocatedEqualsBalance() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"), List.of());
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("20000")));
        assertEquals(0, r.totalAllocated().compareTo(BigDecimal.ZERO));
    }

    @Test
    void singleUnspentBudget_unallocatedIsBalanceMinusAmount() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("5000")));
    }

    @Test
    void spendingWithinBudget_keepsUnallocatedStable() {
        // The regression case: balance dropped from 20000 to 5000 due to spending,
        // but that spending was within the allocated budget, so unallocated stays at 5000.
        BudgetSummaryResponse r = summarize(new BigDecimal("5000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("15000"))));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("5000")));
    }

    @Test
    void partialSpend_unallocatedUnchangedVsUnspent() {
        BudgetSummaryResponse r = summarize(new BigDecimal("19000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("1000"))));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("5000")));
    }

    @Test
    void overspentBudget_commitmentCappedAtZero() {
        BudgetSummaryResponse r = summarize(new BigDecimal("4000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("16000"))));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("4000")));
    }

    @Test
    void spendingOutsideBudget_reducesUnallocated() {
        BudgetSummaryResponse r = summarize(new BigDecimal("19000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("4000")));
    }

    @Test
    void postHocDrift_unallocatedGoesNegative() {
        BudgetSummaryResponse r = summarize(new BigDecimal("10000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("-5000")));
    }

    @Test
    void multipleBudgetsMixedSpend() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"), List.of(
            budget(new BigDecimal("10000"), new BigDecimal("5000")),
            budget(new BigDecimal("5000"), BigDecimal.ZERO)
        ));
        // outstanding = (10000-5000) + (5000-0) = 10000. balance - 10000 = 10000.
        assertEquals(0, r.unallocated().compareTo(new BigDecimal("10000")));
    }

    @Test
    void saveBudget_rejectsOverAllocation() {
        user.setBalance(new BigDecimal("1000"));
        Category category = new Category("Food", true, null, null, null);
        category.setId(1L);

        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Allocation exceeds available balance by 4000.00."))
            .when(budgetValidationService)
            .validateAllocationFits(eq(user), eq(BudgetPeriod.MONTHLY),
                eq(new BigDecimal("5000")), isNull());

        BudgetCreateRequest req = new BudgetCreateRequest(1L, new BigDecimal("5000"), BudgetPeriod.MONTHLY);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> budgetService.saveBudget("test@example.com", req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());

        // Ensure the pool-mutating logic did NOT run when validation throws.
        verify(userAccountRepository, never()).save(any());
        verify(budgetRepository, never()).save(any());
    }
}
