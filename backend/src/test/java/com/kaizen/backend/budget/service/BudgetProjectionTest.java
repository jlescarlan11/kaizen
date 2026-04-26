package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.dto.BudgetResponse;
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

@ExtendWith(MockitoExtension.class)
class BudgetProjectionTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private UserAccountRepository userAccountRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private TransactionService transactionService;
    @Mock
    private BudgetValidationService budgetValidationService;
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserAccount user;
    @Mock
    private Category category;
    @Mock
    private Budget budget;

    private BudgetService budgetService;

    @BeforeEach
    void setUp() {
        lenient().when(user.getId()).thenReturn(1L);
        lenient().when(user.getEmail()).thenReturn("test@example.com");
        
        lenient().when(category.getId()).thenReturn(1L);
        lenient().when(category.getName()).thenReturn("Food");
        
        lenient().when(budget.getId()).thenReturn(1L);
        lenient().when(budget.getUser()).thenReturn(user);
        lenient().when(budget.getCategory()).thenReturn(category);
        lenient().when(budget.getPeriod()).thenReturn(BudgetPeriod.MONTHLY);
    }

    @Test
    void testProjectionsMidMonth() {
        // Set fixed clock to 15th of April 2026 (30 days in month)
        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-15T12:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(budgetRepository, userAccountRepository, categoryRepository, transactionService, fixedClock, budgetValidationService, transactionRepository);

        when(budget.getAmount()).thenReturn(BigDecimal.valueOf(300));
        when(budget.getExpense()).thenReturn(BigDecimal.valueOf(150));

        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findAllByUserId(1L)).thenReturn(List.of(budget));

        List<BudgetResponse> responses = budgetService.getBudgetsWithProjections("test@example.com");

        assertEquals(1, responses.size());
        BudgetResponse res = responses.get(0);

        // daysElapsed = 15, daysLeft = 15
        assertEquals(15, res.daysElapsed());
        assertEquals(15, res.daysLeft());
        // burnRate = 150 / 15 = 10.00
        assertEquals(new BigDecimal("10.00"), res.burnRate());
        // dailyAllowance = (300 - 150) / 15 = 10.00
        assertEquals(new BigDecimal("10.00"), res.dailyAllowance());
        // projectedTotal = 10 * 30 = 300.00
        assertEquals(new BigDecimal("300.00"), res.projectedTotal());
    }

    @Test
    void testInsufficientData() {
        // 2nd of April
        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-02T12:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(budgetRepository, userAccountRepository, categoryRepository, transactionService, fixedClock, budgetValidationService, transactionRepository);

        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findAllByUserId(1L)).thenReturn(List.of(budget));

        List<BudgetResponse> responses = budgetService.getBudgetsWithProjections("test@example.com");

        BudgetResponse res = responses.get(0);
        assertEquals(2, res.daysElapsed());
        assertNull(res.burnRate());
        assertNull(res.projectedTotal());
    }

    @Test
    void testOverbudget() {
        // 10th of April
        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-10T12:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(budgetRepository, userAccountRepository, categoryRepository, transactionService, fixedClock, budgetValidationService, transactionRepository);

        when(budget.getAmount()).thenReturn(BigDecimal.valueOf(100));
        when(budget.getExpense()).thenReturn(BigDecimal.valueOf(150)); // Already overspent

        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findAllByUserId(1L)).thenReturn(List.of(budget));

        List<BudgetResponse> responses = budgetService.getBudgetsWithProjections("test@example.com");

        BudgetResponse res = responses.get(0);
        assertEquals(10, res.daysElapsed());
        // burnRate = 150 / 10 = 15.00
        assertEquals(new BigDecimal("15.00"), res.burnRate());
        // remaining = 100 - 150 = -50
        // daysLeft = 30 - 10 = 20
        // dailyAllowance = -50 / 20 = -2.50
        assertEquals(new BigDecimal("-2.50"), res.dailyAllowance());
        // projectedTotal = 15 * 30 = 450.00
        assertEquals(new BigDecimal("450.00"), res.projectedTotal());
    }
}
