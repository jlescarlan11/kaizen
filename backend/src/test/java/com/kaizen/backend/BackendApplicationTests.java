package com.kaizen.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isOk());
    }

    @Test
    void actuatorLivenessIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
            .andExpect(result -> {
                int code = result.getResponse().getStatus();
                Assertions.assertTrue(
                    code != 401 && code != 403,
                    "Expected /actuator/health/liveness to be public (not 401/403), got " + code
                );
            });
    }

    @Test
    void actuatorReadinessIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
            .andExpect(result -> {
                int code = result.getResponse().getStatus();
                Assertions.assertTrue(
                    code != 401 && code != 403,
                    "Expected /actuator/health/readiness to be public (not 401/403), got " + code
                );
            });
    }

    @Test
    void swaggerUiIsPublic() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
            .andExpect(result -> {
                int code = result.getResponse().getStatus();
                Assertions.assertTrue(
                    code == 200 || (code >= 300 && code < 400),
                    "Expected /swagger-ui.html to be public (200/3xx), got " + code
                );
            });
    }

    @Test
    void protectedEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/probe"))
            .andExpect(status().isUnauthorized());
    }
}
