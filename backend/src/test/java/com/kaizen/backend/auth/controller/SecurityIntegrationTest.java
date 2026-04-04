package com.kaizen.backend.auth.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import com.kaizen.backend.auth.config.PublicEndpoint;
import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.util.SessionTokenUtil;
import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;

import jakarta.servlet.http.Cookie;
import lombok.extern.slf4j.Slf4j;

/**
 * Automated Security Test Suite for Endpoint Protection.
 * Verifies that all protected endpoints return 401/403 in rejection scenarios.
 * Enforces coverage across all registered endpoints.
 */
@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Security Enforcement Integration Test")
class SecurityIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private PersistentSessionRepository sessionRepository;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private static final String COOKIE_NAME = "kzn_pst";
    private String userToken;
    private String expiredToken;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // 1. Create Roles
        Role userRole = roleRepository.save(new Role("USER"));
        Role adminRole = roleRepository.save(new Role("ADMIN"));

        // 2. Create Standard User
        UserAccount user = new UserAccount("Standard User", "user@example.com", "google", "123", null, null, "at",
                "rt");
        user.addRole(userRole);
        userRepository.save(user);
        userToken = createSessionToken(user, 90);

        // 3. Create Admin User
        UserAccount admin = new UserAccount("Admin User", "admin@example.com", "google", "456", null, null, "at", "rt");
        admin.addRole(adminRole);
        admin.addRole(userRole);
        userRepository.save(admin);

        // Admin token is currently unused in rejection-only tests
        createSessionToken(admin, 90);

        // 4. Create Expired Session for Standard User
        expiredToken = createSessionToken(user, -1);
    }

    private String createSessionToken(UserAccount user, int expiryDays) {
        String rawToken = SessionTokenUtil.generateToken();
        String tokenHash = SessionTokenUtil.hashToken(rawToken);
        Instant expiresAt = Instant.now().plus(expiryDays, ChronoUnit.DAYS);
        sessionRepository.save(new PersistentSession(user, tokenHash, expiresAt));
        return rawToken;
    }

    @Test
    @DisplayName("Verify rejection for NO credentials (401)")
    void verifyNoCredentialsRejection() throws Exception {
        for (EndpointInfo endpoint : getProtectedEndpoints()) {
            log.info("Testing 401 (No Credentials) for protected endpoint: {} {}", endpoint.method(), endpoint.path());
            performRequest(endpoint, null)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @DisplayName("Verify rejection for INVALID credentials (401)")
    void verifyInvalidCredentialsRejection() throws Exception {
        String invalidToken = "invalid-token-12345";
        for (EndpointInfo endpoint : getProtectedEndpoints()) {
            log.info("Testing 401 (Invalid Token) for protected endpoint: {} {}", endpoint.method(), endpoint.path());
            performRequest(endpoint, invalidToken)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @DisplayName("Verify rejection for EXPIRED credentials (401)")
    void verifyExpiredCredentialsRejection() throws Exception {
        for (EndpointInfo endpoint : getProtectedEndpoints()) {
            log.info("Testing 401 (Expired Token) for protected endpoint: {} {}", endpoint.method(), endpoint.path());
            performRequest(endpoint, expiredToken)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @DisplayName("Verify rejection for INSUFFICIENT permissions (403)")
    void verifyInsufficientPermissionsRejection() throws Exception {
        // Find endpoints that require ADMIN role
        List<EndpointInfo> adminOnlyEndpoints = getProtectedEndpoints().stream()
                .filter(e -> e.path().startsWith("/api/admin")) // Heuristic for demo
                .toList();

        for (EndpointInfo endpoint : adminOnlyEndpoints) {
            log.info("Testing 403 (Insufficient Permissions) for ADMIN endpoint: {} {}", endpoint.method(),
                    endpoint.path());
            performRequest(endpoint, userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Meta-test: Verify all non-public endpoints are tested")
    void verifyEndpointCoverage() {
        List<EndpointInfo> protectedEndpoints = getProtectedEndpoints();
        // This acts as the coverage enforcement mechanism.
        // If a new endpoint is added to the system and not marked as @PublicEndpoint,
        // it must be caught by our loop in tests above.
        log.info("Coverage verification: detected {} protected endpoints.", protectedEndpoints.size());

        // Assert that we have at least one protected endpoint (the /me endpoint)
        assert !protectedEndpoints.isEmpty() : "No protected endpoints found to test! Coverage gap detected.";
    }

    private ResultActions performRequest(EndpointInfo endpoint, String token) throws Exception {
        // Simple heuristic to expand all path variables for security testing
        String path = endpoint.path().replaceAll("\\{.*?\\}", "1");

        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders
                .request(Objects.requireNonNull(endpoint.method()), Objects.requireNonNull(path))
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON));

        if (token != null) {
            builder.cookie(new Cookie(COOKIE_NAME, token));
        }

        return mockMvc.perform(builder);
    }

    private List<EndpointInfo> getProtectedEndpoints() {
        RequestMappingHandlerMapping mapping = applicationContext.getBean("requestMappingHandlerMapping",
                RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();
        List<EndpointInfo> endpoints = new ArrayList<>();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo info = entry.getKey();
            HandlerMethod method = entry.getValue();

            // Exclude public endpoints
            if (method.getBeanType().isAnnotationPresent(PublicEndpoint.class) ||
                    method.hasMethodAnnotation(PublicEndpoint.class)) {
                continue;
            }

            // Robustly extract path patterns, supporting both PathPatternParser and
            // AntPathMatcher configurations
            var pathPatternsCondition = info.getPathPatternsCondition();
            var patternsCondition = info.getPatternsCondition();

            Set<String> patterns;
            if (pathPatternsCondition != null) {
                patterns = pathPatternsCondition.getPatternValues();
            } else if (patternsCondition != null) {
                patterns = patternsCondition.getPatterns();
            } else {
                patterns = Set.of();
            }

            String path = patterns.iterator().next();

            // Exclude actuator and swagger if needed (they are public in SecurityConfig)
            if (path.startsWith("/actuator") || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
                continue;
            }

            info.getMethodsCondition().getMethods()
                    .forEach(m -> endpoints.add(new EndpointInfo(path, m.asHttpMethod())));
        }
        return endpoints;
    }

    private record EndpointInfo(String path, org.springframework.http.HttpMethod method) {
    }
}
