package com.kaizen.backend.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = {
    "app.seed.enabled=false"
})
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=validate"
})
@DisplayName("Google Sign-in Robustness Fix Verification Test")
class GoogleSignInRobustnessIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Should handle duplicate emails with different casing after V2 migration")
    void shouldHandleDuplicateEmailsAfterMigration() {
        // V1 and V2 migrations should have run
        
        // 1. Verify index exists
        Boolean indexExists = jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uk_user_account_email_case_insensitive')",
            Boolean.class
        );
        assertTrue(indexExists, "Case-insensitive unique index should exist");

        // 2. Try to save two users with same email but different casing manually (should fail)
        jdbcTemplate.execute("INSERT INTO user_account (id, name, email, provider_name, provider_user_id, encrypted_access_token, created_at, updated_at) " +
            "VALUES (100, 'User 1', 'test@example.com', 'google', 'id-1', 'token', NOW(), NOW())");
        
        try {
            jdbcTemplate.execute("INSERT INTO user_account (id, name, email, provider_name, provider_user_id, encrypted_access_token, created_at, updated_at) " +
                "VALUES (101, 'User 2', 'TEST@EXAMPLE.COM', 'google', 'id-2', 'token', NOW(), NOW())");
            assertTrue(false, "Should have thrown exception due to unique index on LOWER(email)");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("uk_user_account_email_case_insensitive"));
        }

        // 3. Verify findByEmailIgnoreCase works as expected
        UserAccount found = userRepository.findByEmailIgnoreCase("TEST@EXAMPLE.COM").orElse(null);
        assertNotNull(found);
        assertEquals("test@example.com", found.getEmail());
    }
}
