package com.kaizen.backend.user.controller;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.service.CustomUserDetailsService;
import com.kaizen.backend.user.dto.UserProfileResponse;
import com.kaizen.backend.user.service.UserAccountService;

@WebMvcTest(UserAccountController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserAccountService userAccountService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private PersistentSessionRepository persistentSessionRepository;

    @Test
    @WithMockUser(username = "test@example.com")
    void meReturnsUserProfileWhenAuthenticated() throws Exception {
        UserProfileResponse response = new UserProfileResponse(
            1L,
            "Test User",
            "test@example.com",
            "http://example.com/pic.jpg",
            Instant.parse("2026-03-18T10:00:00Z")
        );

        when(userAccountService.getProfileByEmail("test@example.com"))
            .thenReturn(response);

        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Test User"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void meReturnsNotFoundWhenUnauthenticated() throws Exception {
        // Without @WithMockUser, @AuthenticationPrincipal UserDetails will be null
        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"))
            .andExpect(jsonPath("$.message").value("Resource not found"));
    }
}
