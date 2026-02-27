package com.kaizen.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.kaizen.backend.support.AbstractPostgresContainerIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class PostgresContainerIntegrationTest extends AbstractPostgresContainerIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void datasourceUsesRunningPostgresContainer() {
        Integer one = jdbcTemplate.queryForObject("select 1", Integer.class);
        assertEquals(1, one);
    }
}
