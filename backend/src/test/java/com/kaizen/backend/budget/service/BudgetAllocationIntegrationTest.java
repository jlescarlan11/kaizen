package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * End-to-end integration test for the new unallocated-balance accounting model.
 *
 * <p>Boots the full Spring context against a Testcontainers-managed Postgres
 * instance so Flyway runs the real migrations (including V4 which drops the
 * legacy pool columns) and Hibernate validates the schema against the JPA
 * entities. This is intentionally the only test in the suite that does so —
 * the rest of the budget coverage is Mockito-based and would not catch
 * migration or schema drift.
 *
 * <p>Covers two critical invariants from the Budget Unallocated Redesign:
 * <ol>
 *   <li><b>Within-budget spending must not move {@code unallocated}.</b>
 *       The remaining commitment (amount − expense) for that category is
 *       replaced 1:1 by the balance decrease, so unallocated stays stable.
 *   <li><b>Income deletion after allocation can push unallocated negative.</b>
 *       When balance falls below the sum of outstanding commitments the
 *       formula produces a negative unallocated — this is the drift case
 *       the redesign tolerates (no retroactive rejection).
 * </ol>
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BudgetAllocationIntegrationTest {

    // Manually managed container (no testcontainers-junit-jupiter on the
    // classpath). `start()` is idempotent and the JVM shuts the container
    // down on exit, so a single static instance shared across this class
    // is sufficient.
    static final PostgreSQLContainer<?> POSTGRES;

    static {
        POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("kaizen_test")
            .withUsername("kaizen")
            .withPassword("kaizen");
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void registerDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired private BudgetService budgetService;
    @Autowired private TransactionService transactionService;
    @Autowired private UserAccountRepository userAccountRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;

    @Test
    void spendingWithinBudget_keepsUnallocatedStable() {
        UserAccount user = seedUser();
        PaymentMethod paymentMethod = seedPaymentMethod(user);
        Category food = findGlobalCategory("Food");

        // Income of 20,000 brings the balance up.
        addTransaction(user, paymentMethod, TransactionType.INCOME,
            new BigDecimal("20000"), null);

        // Allocate 15,000 to Food. unallocated = 20,000 − 15,000 = 5,000.
        budgetService.saveBudget(user.getEmail(), new BudgetCreateRequest(
            food.getId(), new BigDecimal("15000"), BudgetPeriod.MONTHLY));

        BudgetSummaryResponse before = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, before.unallocated().compareTo(new BigDecimal("5000")),
            "after allocation, unallocated = 20,000 − 15,000 = 5,000");

        // Spend 15,000 on Food — entirely within the allocation.
        // Balance drops to 5,000 and the outstanding commitment (amount − expense)
        // for Food drops from 15,000 to 0, so unallocated must stay at 5,000.
        addTransaction(user, paymentMethod, TransactionType.EXPENSE,
            new BigDecimal("15000"), food);

        BudgetSummaryResponse after = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, after.unallocated().compareTo(new BigDecimal("5000")),
            "unallocated must not change when spending is within an existing allocation");
        assertEquals(0, after.balance().compareTo(new BigDecimal("5000")),
            "balance should reflect 20,000 income − 15,000 expense");
        assertEquals(0, after.totalAllocated().compareTo(new BigDecimal("15000")));
        assertEquals(0, after.totalSpent().compareTo(new BigDecimal("15000")));
    }

    @Test
    void incomeDeletedPostAllocation_unallocatedGoesNegative() {
        UserAccount user = seedUser();
        PaymentMethod paymentMethod = seedPaymentMethod(user);
        Category food = findGlobalCategory("Food");

        TransactionResponse income = addTransaction(user, paymentMethod,
            TransactionType.INCOME, new BigDecimal("20000"), null);
        assertNotNull(income.id(), "income transaction id should be populated");

        // Allocate 15,000 while balance still covers it.
        budgetService.saveBudget(user.getEmail(), new BudgetCreateRequest(
            food.getId(), new BigDecimal("15000"), BudgetPeriod.MONTHLY));

        // Delete the income. Balance now 0, outstanding commitment still 15,000.
        // unallocated = 0 − 15,000 = −15,000 (drift: the redesign allows this
        // rather than blocking a post-allocation delete).
        transactionService.deleteTransaction(user.getEmail(), income.id());

        BudgetSummaryResponse after = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, after.unallocated().compareTo(new BigDecimal("-15000")),
            "deleting income after allocation must produce unallocated = balance − commitment = −15,000");
        assertEquals(0, after.balance().compareTo(BigDecimal.ZERO),
            "balance should return to 0 after the income is deleted");
        assertEquals(0, after.totalAllocated().compareTo(new BigDecimal("15000")),
            "allocation is retained — nothing in the delete path clears budgets");
    }

    // --- helpers ---------------------------------------------------------

    /**
     * Seeds a fresh user with a unique email/provider identity so repeated
     * test runs and transactional rollback quirks never collide on the
     * user_account unique constraint.
     */
    private UserAccount seedUser() {
        String unique = UUID.randomUUID().toString();
        UserAccount user = new UserAccount(
            "Integration Test User",
            "int-test-" + unique + "@example.com",
            "LOCAL",
            unique,
            null,
            null,
            "encrypted-access-token",
            null);
        return userAccountRepository.save(user);
    }

    /**
     * Each user needs at least one payment method so expense transactions
     * can pass the per-payment-method balance check. The helper creates a
     * user-owned method pre-funded via subsequent INCOME transactions.
     */
    private PaymentMethod seedPaymentMethod(UserAccount user) {
        PaymentMethod method = new PaymentMethod("Test Cash", false, user);
        return paymentMethodRepository.save(method);
    }

    /**
     * V1__Initial_Schema.sql does not seed categories — they are created by
     * {@code CategoryDataInitializer} via a CommandLineRunner at context
     * startup. The {@code Food} template from {@code CategoryDesignSystem}
     * is therefore always present as a global category.
     */
    private Category findGlobalCategory(String name) {
        return categoryRepository.findByNameIgnoreCaseAndGlobalTrue(name)
            .orElseThrow(() -> new IllegalStateException(
                "Expected global category '" + name + "' to be seeded by CategoryDataInitializer"));
    }

    private TransactionResponse addTransaction(
            UserAccount user, PaymentMethod paymentMethod, TransactionType type,
            BigDecimal amount, Category category) {
        TransactionRequest request = TransactionRequest.builder()
            .amount(amount)
            .type(type)
            .paymentMethodId(paymentMethod.getId())
            .categoryId(category == null ? null : category.getId())
            .transactionDate(OffsetDateTime.now())
            .isRecurring(false)
            .build();
        return transactionService.createTransaction(user.getEmail(), request);
    }
}
