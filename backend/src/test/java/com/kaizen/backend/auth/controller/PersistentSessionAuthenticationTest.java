package com.kaizen.backend.auth.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.util.SessionTokenUtil;
import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Persistent Session Authentication Integration Test")
class PersistentSessionAuthenticationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PersistentSessionRepository sessionRepository;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private static final String COOKIE_NAME = "kzn_pst";
    private String validToken;
    private UserAccount testUser;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role userRole = roleRepository.save(new Role("USER"));
        
        testUser = new UserAccount("Test User", "test@example.com", "google", "12345", null, null, "at", "rt");
        testUser.addRole(userRole);
        userRepository.save(testUser);

        validToken = SessionTokenUtil.generateToken();
        String tokenHash = SessionTokenUtil.hashToken(validToken);
        Instant expiresAt = Instant.now().plus(90, ChronoUnit.DAYS);
        sessionRepository.save(new PersistentSession(testUser, tokenHash, expiresAt));
    }

    @Test
    @DisplayName("Should successfully authenticate with valid persistent token")
    void shouldAuthenticateWithValidToken() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .cookie(new Cookie(COOKIE_NAME, validToken))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.name").value("Test User"));
    }
}
