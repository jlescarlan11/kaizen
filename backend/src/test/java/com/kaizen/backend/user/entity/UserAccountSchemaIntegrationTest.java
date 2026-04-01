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
        
        assertTrue(columns.contains("budget_setup_skipped"), "Column budget_setup_skipped should exist");
    }
}
