package com.kaizen.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@SpringBootTest
@TestPropertySource(properties = {
        "app.cors.allowed-origins=https://example.test,https://other.test"
})
class SecurityConfigCorsTest {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void corsConfigurationReadsAllowedOriginsFromProperty() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/anything");

        CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins())
                .containsExactly("https://example.test", "https://other.test");
    }
}
