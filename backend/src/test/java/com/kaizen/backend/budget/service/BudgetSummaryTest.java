package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.repository.CategoryRepository;
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

@ExtendWith(MockitoExtension.class)
class BudgetSummaryTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private TransactionService transactionService;

    private BudgetService budgetService;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-04-23T00:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(
            budgetRepository, userAccountRepository, categoryRepository, transactionService, clock
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
}
