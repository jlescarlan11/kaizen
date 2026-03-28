package com.kaizen.backend.user.validation;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.service.PersistentSessionService;
import com.kaizen.backend.auth.config.SessionProperties;
import com.kaizen.backend.common.constants.ValidationConstants;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;
import com.kaizen.backend.user.repository.UserFundingSourceRepository;
import static com.kaizen.backend.support.TestConstants.JSON_MEDIA_TYPE;
import jakarta.servlet.http.Cookie;
import java.math.BigDecimal;
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

/**
 * Integration tests for the onboarding validation rules defined in Instruction 3.
 * Each rule exposes an invalid case that produces a structured ValidationErrorResponse
 * and a matching valid case so the validation layer can be regression tested end-to-end.
 */
@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null") // Eclipse null-checker false positives on MockMvc/JPA return types
class OnboardingValidationIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PersistentSessionService persistentSessionService;

    @Autowired
    private PersistentSessionRepository sessionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private UserFundingSourceRepository userFundingSourceRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SessionProperties sessionProperties;

    private UserAccount user;
    private Cookie authCookie;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        budgetRepository.deleteAll();
        userFundingSourceRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role userRole = roleRepository.save(new Role("USER"));

        user = new UserAccount(
            "Onboarding Tester",
            "onboarding@example.com",
            "google",
            "onboarding-uid",
            null,
            null,
            "access-token",
            "refresh-token"
        );
        user.addRole(userRole);
        user = userRepository.save(user);

        String rawToken = persistentSessionService.createSession(user.getEmail());
        authCookie = new Cookie(sessionProperties.cookieName(), rawToken);
    }

    @Test
    @DisplayName("Missing balance returns structured validation error")
    void missingOpeningBalanceReturnsValidationError() throws Exception {
        ValidationErrorResponse response = postOnboarding(Map.of());

        assertAll(
            () -> assertTrue(response.errors().stream()
                .anyMatch(error ->
                    "startingFunds".equals(error.field())
                        && ValidationConstants.BALANCE_REQUIRED_ERROR.equals(error.message())
                ),
                "Expected validation error for missing starting funds"
            ),
            () -> assertTrue(response.errors().stream()
                .anyMatch(error ->
                    "fundingSourceType".equals(error.field())
                        && ValidationConstants.FUNDING_SOURCE_REQUIRED_ERROR.equals(error.message())
                ),
                "Expected validation error for missing funding source type"
            )
        );
    }

    @Test
    @DisplayName("Negative balance returns positive-check validation error")
    void negativeOpeningBalanceReturnsValidationError() throws Exception {
        ValidationErrorResponse response = postOnboarding(Map.of(
            "startingFunds", new BigDecimal("-10.00"),
            "fundingSourceType", "CASH_ON_HAND"
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "startingFunds".equals(error.field())
                    && ValidationConstants.BALANCE_POSITIVE_ERROR.equals(error.message())
            ), "Expected positive balance violation");
    }

    @Test
    @DisplayName("Balance above maximum returns max-limit validation error")
    void balanceAboveMaximumReturnsValidationError() throws Exception {
        BigDecimal max = new BigDecimal(ValidationConstants.MAX_BALANCE_VALUE);
        ValidationErrorResponse response = postOnboarding(Map.of(
            "startingFunds", max.add(BigDecimal.ONE),
            "fundingSourceType", "BANK_ACCOUNT"
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "startingFunds".equals(error.field())
                    && ValidationConstants.BALANCE_MAX_LIMIT_ERROR.equals(error.message())
            ), "Expected max balance violation");
    }

    @Test
    @DisplayName("Invalid funding source returns validation error")
    void invalidFundingSourceReturnsValidationError() throws Exception {
        ValidationErrorResponse response = postOnboarding(Map.of(
            "startingFunds", new BigDecimal("10.00"),
            "fundingSourceType", "PIGGY_BANK"
        ));

        assertTrue(response.errors().stream()
            .anyMatch(error ->
                "fundingSourceType".equals(error.field())
                    && ValidationConstants.FUNDING_SOURCE_INVALID_ERROR.equals(error.message())
            ), "Expected invalid funding source violation");
    }

    @Test
    @DisplayName("Positive starting funds with a valid funding source are accepted")
    void positiveOpeningBalanceSucceeds() throws Exception {
        mockMvc.perform(post("/api/users/onboarding")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(Objects.requireNonNull(objectMapper.writeValueAsString(Map.of(
                "startingFunds", new BigDecimal("10.00"),
                "fundingSourceType", "E_WALLET"
            )))))
            .andExpect(status().isOk())
            .andReturn();

        assertTrue(
            userFundingSourceRepository.findByUserAccountId(user.getId()).size() == 1,
            "Expected one funding source to be created during onboarding completion"
        );
    }

    @Test
    @DisplayName("Balance exactly at maximum is accepted")
    void maximumOpeningBalanceSucceeds() throws Exception {
        BigDecimal max = new BigDecimal(ValidationConstants.MAX_BALANCE_VALUE);
        mockMvc.perform(post("/api/users/onboarding")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(Objects.requireNonNull(objectMapper.writeValueAsString(Map.of(
                "startingFunds", max,
                "fundingSourceType", "BANK_ACCOUNT"
            )))))
            .andExpect(status().isOk())
            .andReturn();
    }

    @Test
    @DisplayName("Reset onboarding removes persisted funding sources")
    void resetOnboardingDeletesFundingSources() throws Exception {
        mockMvc.perform(post("/api/users/onboarding")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(Objects.requireNonNull(objectMapper.writeValueAsString(Map.of(
                "startingFunds", new BigDecimal("500.00"),
                "fundingSourceType", "CASH_ON_HAND"
            )))))
            .andExpect(status().isOk());

        assertTrue(
            userFundingSourceRepository.findByUserAccountId(user.getId()).size() == 1,
            "Expected one funding source to exist after onboarding completion"
        );

        mockMvc.perform(post("/api/users/onboarding/reset").cookie(authCookie))
            .andExpect(status().isOk());

        assertTrue(
            userFundingSourceRepository.findByUserAccountId(user.getId()).isEmpty(),
            "Expected funding sources to be removed when onboarding is reset"
        );
    }

    private ValidationErrorResponse postOnboarding(Map<String, ?> payload) throws Exception {
        ResultActions result = mockMvc.perform(post("/api/users/onboarding")
            .contentType(JSON_MEDIA_TYPE)
            .cookie(authCookie)
            .content(Objects.requireNonNull(objectMapper.writeValueAsString(payload))));

        return objectMapper.readValue(
            result.andExpect(status().isBadRequest()).andReturn().getResponse().getContentAsString(),
            ValidationErrorResponse.class
        );
    }
}
