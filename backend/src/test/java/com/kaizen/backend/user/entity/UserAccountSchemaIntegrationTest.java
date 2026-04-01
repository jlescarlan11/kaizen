package com.kaizen.backend.user.entity;

import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=validate"
})
class UserAccountSchemaIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void verifyUserAccountColumns() {
        List<String> columns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_account'",
            String.class
        );
        
        System.out.println("Columns in user_account table: " + columns);
        
        assertTrue(columns.contains("name"), "Column name should exist");
        assertTrue(columns.contains("email"), "Column email should exist");
        assertTrue(columns.contains("provider_name"), "Column provider_name should exist");
        assertTrue(columns.contains("provider_user_id"), "Column provider_user_id should exist");
        assertTrue(columns.contains("picture_url"), "Column picture_url should exist");
        assertTrue(columns.contains("onboarding_completed"), "Column onboarding_completed should exist");
        assertTrue(columns.contains("tour_completed"), "Column tour_completed should exist");
        assertTrue(columns.contains("budget_setup_skipped"), "Column budget_setup_skipped should exist");
        assertTrue(columns.contains("first_transaction_added"), "Column first_transaction_added should exist");
        assertTrue(columns.contains("quick_add_preferences"), "Column quick_add_preferences should exist");
        assertTrue(columns.contains("reminders_enabled"), "Column reminders_enabled should exist");
    }

    @Test
    void verifyTransactionColumns() {
        List<String> columns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'transaction'",
            String.class
        );
        
        assertTrue(columns.contains("category_id"), "Column category_id should exist");
    }
}
