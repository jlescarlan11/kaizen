package com.kaizen.backend.transaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@SpringBootTest
@Transactional
public class TransactionBudgetIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    public void testCreateExpenseUpdatesBudget() {
        // Setup user
        UserAccount user = new UserAccount("Test User", "test@example.com", "local", "123", null, null, "token", null);
        user = userAccountRepository.save(user);

        // Setup category
        Category category = new Category("Food", true, null, "utensils", "#FF0000");
        category = categoryRepository.save(category);

        // Setup budget
        Budget budget = new Budget(user, category, new BigDecimal("1000.00"), BudgetPeriod.MONTHLY);
        budget = budgetRepository.save(budget);

        assertThat(budget.getExpense()).isEqualByComparingTo(BigDecimal.ZERO);

        // Create expense transaction
        TransactionRequest request = TransactionRequest.builder()
            .amount(new BigDecimal("100.00"))
            .type(TransactionType.EXPENSE)
            .categoryId(category.getId())
            .description("Lunch")
            .transactionDate(LocalDateTime.now())
            .build();

        transactionService.createTransaction(user.getEmail(), request);

        // Verify budget expense update
        Budget updatedBudget = budgetRepository.findById(budget.getId()).orElseThrow();
        assertThat(updatedBudget.getExpense()).isEqualByComparingTo(new BigDecimal("100.00"));
    }
}
