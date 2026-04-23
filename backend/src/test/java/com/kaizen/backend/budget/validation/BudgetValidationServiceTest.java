package com.kaizen.backend.budget.validation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.config.ValidationProperties;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BudgetValidationServiceTest {

    @Mock private ValidationProperties validationProperties;
    @Mock private BudgetRepository budgetRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserAccountRepository userAccountRepository;

    private BudgetValidationService validator;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        validator = new BudgetValidationService(
            validationProperties,
            budgetRepository,
            categoryRepository,
            userAccountRepository
        );
        user = new UserAccount("Test", "t@e.com", "LOCAL", "1", null, null, "tok", null);
        ReflectionTestUtils.setField(user, "id", 99L);
    }

    private Budget budget(Long id, BigDecimal amount, BigDecimal expense) {
        Budget b = new Budget(user, null, amount, BudgetPeriod.MONTHLY);
        b.setExpense(expense);
        if (id != null) ReflectionTestUtils.setField(b, "id", id);
        return b;
    }

    @Test
    void createBudgetThatFits_passes() {
        user.setBalance(new BigDecimal("20000"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of());
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("15000"), null));
    }

    @Test
    void createBudgetThatExceedsBalance_throws400() {
        user.setBalance(new BigDecimal("10000"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("15000"), null));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("5000"),
            "error message should name the shortfall: " + ex.getReason());
    }

    @Test
    void overspentBudget_canBeEditedToAnyAmount() {
        // Existing budget: amount=1000, expense=1500 (overspent).
        // Editing to amount=1200 still yields newCommitment = max(0, 1200 - 1500) = 0.
        user.setBalance(new BigDecimal("100"));
        Budget existing = budget(1L, new BigDecimal("1000"), new BigDecimal("1500"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("1200"), existing.getId()));
    }

    @Test
    void reduceBudgetUnderDrift_passes() {
        // Drift: balance 5000, existing budget 10000 / 0 -> unallocated is -5000.
        // Reducing the budget to 4000 should pass (reduction never increases shortfall).
        user.setBalance(new BigDecimal("5000"));
        Budget existing = budget(1L, new BigDecimal("10000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("4000"), existing.getId()));
    }

    @Test
    void increaseBudgetBeyondHeadroom_throws() {
        user.setBalance(new BigDecimal("10000"));
        Budget existing = budget(1L, new BigDecimal("5000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertThrows(ResponseStatusException.class, () ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("12000"), existing.getId()));
    }

    @Test
    void increaseBudgetWithinHeadroom_passes() {
        user.setBalance(new BigDecimal("10000"));
        Budget existing = budget(1L, new BigDecimal("5000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("9000"), existing.getId()));
    }
}
