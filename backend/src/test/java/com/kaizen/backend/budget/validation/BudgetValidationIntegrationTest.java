package com.kaizen.backend.budget.validation;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.service.PersistentSessionService;
import com.kaizen.backend.auth.config.SessionProperties;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.constants.ValidationConstants;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import static com.kaizen.backend.support.TestConstants.JSON_MEDIA_TYPE;
import jakarta.servlet.http.Cookie;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Budget validation integration tests")
class BudgetValidationIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PersistentSessionService persistentSessionService;

    @Autowired
    private PersistentSessionRepository sessionRepository;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private SessionProperties sessionProperties;

    private UserAccount user;
    private Cookie authCookie;
    private Category primaryCategory;
    private Category secondaryCategory;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        budgetRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        categoryRepository.deleteAll();

        Role userRole = roleRepository.save(new Role("USER"));

        user = new UserAccount(
            "Budget Tester",
            "budget@example.com",
            "google",
            "budget-uid",
            null,
            null,
            "token",
            "refresh"
        );
        user.addRole(userRole);
        user.setBalance(new BigDecimal("200.00"));
        user = userRepository.save(user);

        String token = persistentSessionService.createSession(user.getEmail());
        authCookie = new Cookie(sessionProperties.cookieName(), token);

        primaryCategory = categoryRepository.save(new Category("Needs", true, null, "icon-1", "#000000"));
        secondaryCategory = categoryRepository.save(new Category("Wants", true, null, "icon-2", "#111111"));
    }

    @Test
    @DisplayName("Rejects budgets with non-positive amounts")
    void rejectsNonPositiveBudgetAmounts() throws Exception {
        ValidationErrorResponse response = postBudgetBatch(List.of(
            budgetEntry(primaryCategory.getId(), new BigDecimal("-1.00"), BudgetPeriod.MONTHLY)
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budgets[0].amount".equals(error.field())
                    && ValidationConstants.BUDGET_AMOUNT_POSITIVE_ERROR.equals(error.message())
            ), "Expected positive amount validation error");
    }

    @Test
    @DisplayName("Accepts positive budget amounts")
    void acceptsPositiveBudgetAmounts() throws Exception {
        mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(List.of(
                budgetEntry(primaryCategory.getId(), new BigDecimal("100.00"), BudgetPeriod.MONTHLY)
            ))))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Rejects budgets exceeding available balance per entry")
    void rejectsBudgetAmountOverBalance() throws Exception {
        ValidationErrorResponse response = postBudgetBatch(List.of(
            budgetEntry(primaryCategory.getId(), new BigDecimal("250.00"), BudgetPeriod.MONTHLY)
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budgets[0].amount".equals(error.field())
                    && ValidationConstants.BUDGET_OVER_BALANCE_ERROR.equals(error.message())
            ), "Expected per-entry balance constraint violation");
    }

    @Test
    @DisplayName("Accepts budgets within balance per entry")
    void acceptsBudgetAmountWithinBalance() throws Exception {
        mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(List.of(
                budgetEntry(primaryCategory.getId(), new BigDecimal("150.00"), BudgetPeriod.MONTHLY)
            ))))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Rejects budgets whose total exceeds the available balance")
    void rejectsCombinedBudgetTotalOverBalance() throws Exception {
        ValidationErrorResponse response = postBudgetBatch(List.of(
            budgetEntry(primaryCategory.getId(), new BigDecimal("160.00"), BudgetPeriod.MONTHLY),
            budgetEntry(secondaryCategory.getId(), new BigDecimal("60.00"), BudgetPeriod.MONTHLY)
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budgets.total".equals(error.field())
                    && ValidationConstants.BUDGET_TOTAL_OVER_BALANCE_ERROR.equals(error.message())
            ), "Expected total balance constraint violation");
    }

    @Test
    @DisplayName("Accepts combined budgets within the available balance")
    void acceptsCombinedBudgetTotalWithinBalance() throws Exception {
        mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(List.of(
                budgetEntry(primaryCategory.getId(), new BigDecimal("80.00"), BudgetPeriod.MONTHLY),
                budgetEntry(secondaryCategory.getId(), new BigDecimal("20.00"), BudgetPeriod.MONTHLY)
            ))))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Rejects non-existent categories")
    void rejectsNonexistentCategory() throws Exception {
        ValidationErrorResponse response = postBudgetBatch(List.of(
            budgetEntry(999999L, new BigDecimal("10.00"), BudgetPeriod.MONTHLY)
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budgets[0].categoryId".equals(error.field())
                    && ValidationConstants.CATEGORY_NOT_FOUND_ERROR.equals(error.message())
            ), "Expected category existence validation error");
    }

    @Test
    @DisplayName("Accepts existing categories")
    void acceptsExistingCategory() throws Exception {
        mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(List.of(
                budgetEntry(primaryCategory.getId(), new BigDecimal("10.00"), BudgetPeriod.MONTHLY)
            ))))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Rejects duplicate category entries")
    void rejectsDuplicateCategories() throws Exception {
        ValidationErrorResponse response = postBudgetBatch(List.of(
            budgetEntry(primaryCategory.getId(), new BigDecimal("10.00"), BudgetPeriod.MONTHLY),
            budgetEntry(primaryCategory.getId(), new BigDecimal("15.00"), BudgetPeriod.MONTHLY)
        ));

        assertTrue(response.errors().stream()
            .filter(error -> ValidationConstants.DUPLICATE_CATEGORY_ERROR.equals(error.message()))
            .map(error -> error.field())
            .anyMatch(field -> field.startsWith("budgets")), "Expected duplicate category validation errors for each entry");
    }

    @Test
    @DisplayName("Accepts distinct categories")
    void acceptsDistinctCategories() throws Exception {
        mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(List.of(
                budgetEntry(primaryCategory.getId(), new BigDecimal("10.00"), BudgetPeriod.MONTHLY),
                budgetEntry(secondaryCategory.getId(), new BigDecimal("15.00"), BudgetPeriod.MONTHLY)
            ))))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Rejects single budget when existing allocations leave insufficient remaining balance")
    void rejectsSingleBudgetOverRemainingBalance() throws Exception {
        budgetRepository.saveAll(List.of(
            new com.kaizen.backend.budget.entity.Budget(user, primaryCategory, new BigDecimal("180.00"), BudgetPeriod.MONTHLY)
        ));

        ValidationErrorResponse response = postSingleBudget(
            budgetEntry(secondaryCategory.getId(), new BigDecimal("30.00"), BudgetPeriod.MONTHLY)
        );

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budget.amount".equals(error.field())
                    && ValidationConstants.BUDGET_OVER_BALANCE_ERROR.equals(error.message())
            ), "Expected remaining-balance violation for single budget creation");
        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budget.total".equals(error.field())
                    && ValidationConstants.BUDGET_TOTAL_OVER_BALANCE_ERROR.equals(error.message())
            ), "Expected total-over-balance violation for single budget creation");
    }

    @Test
    @DisplayName("Rejects single budget when category already has a persisted budget")
    void rejectsDuplicatePersistedCategoryOnSingleCreate() throws Exception {
        budgetRepository.save(new com.kaizen.backend.budget.entity.Budget(
            user,
            primaryCategory,
            new BigDecimal("20.00"),
            BudgetPeriod.MONTHLY
        ));

        ValidationErrorResponse response = postSingleBudget(
            budgetEntry(primaryCategory.getId(), new BigDecimal("15.00"), BudgetPeriod.MONTHLY)
        );

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "budget.categoryId".equals(error.field())
                    && ValidationConstants.DUPLICATE_CATEGORY_ERROR.equals(error.message())
            ), "Expected duplicate-category validation error for single budget creation");
    }

    @Test
    @DisplayName("Returns budget summary without mutating the stored user balance")
    void returnsBudgetSummaryAndPreservesStoredBalance() throws Exception {
        budgetRepository.saveAll(List.of(
            new com.kaizen.backend.budget.entity.Budget(user, primaryCategory, new BigDecimal("80.00"), BudgetPeriod.MONTHLY),
            new com.kaizen.backend.budget.entity.Budget(user, secondaryCategory, new BigDecimal("20.00"), BudgetPeriod.WEEKLY)
        ));

        BudgetSummaryResponse response = objectMapper.readValue(
            mockMvc.perform(get("/api/budgets/summary")
                .cookie(authCookie))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            BudgetSummaryResponse.class
        );

        assertTrue(new BigDecimal("200.00").compareTo(response.balance()) == 0, "Expected actual balance to remain unchanged");
        assertTrue(new BigDecimal("100.00").compareTo(response.totalAllocated()) == 0, "Expected allocated total to match saved budgets");
        assertTrue(new BigDecimal("100.00").compareTo(response.remainingToAllocate()) == 0, "Expected remaining allocatable amount to be derived from balance minus budgets");
        assertTrue(response.allocationPercentage() == 50, "Expected allocation percentage to be derived from allocated vs balance");
        assertTrue(response.budgetCount() == 2, "Expected summary count to match saved budgets");
        assertTrue(
            new BigDecimal("200.00").compareTo(
                userRepository.findById(user.getId()).orElseThrow().getBalance()
            ) == 0,
            "Expected persisted user balance to remain unchanged after summary calculation"
        );
    }

    private ValidationErrorResponse postBudgetBatch(List<Map<String, Object>> budgets) throws Exception {
        ResultActions result = mockMvc.perform(post("/api/budgets/batch")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(buildBudgetPayload(budgets)));

        return objectMapper.readValue(
            result.andExpect(status().isBadRequest()).andReturn().getResponse().getContentAsString(),
            ValidationErrorResponse.class
        );
    }

    private ValidationErrorResponse postSingleBudget(Map<String, Object> budget) throws Exception {
        ResultActions result = mockMvc.perform(post("/api/budgets")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(Objects.requireNonNull(objectMapper.writeValueAsString(budget))));

        return objectMapper.readValue(
            result.andExpect(status().isBadRequest()).andReturn().getResponse().getContentAsString(),
            ValidationErrorResponse.class
        );
    }

    private String buildBudgetPayload(List<Map<String, Object>> budgets) throws Exception {
        return Objects.requireNonNull(objectMapper.writeValueAsString(Map.of("budgets", budgets)));
    }

    private Map<String, Object> budgetEntry(Long categoryId, BigDecimal amount, BudgetPeriod period) {
        return Map.of(
            "categoryId", categoryId,
            "amount", amount,
            "period", period.name()
        );
    }
}
