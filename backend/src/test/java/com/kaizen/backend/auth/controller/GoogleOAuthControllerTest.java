package com.kaizen.backend.auth.controller;

import java.net.URI;
import java.util.Collections;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kaizen.backend.auth.config.AuthFlowProperties;
import com.kaizen.backend.auth.service.CustomUserDetailsService;
import com.kaizen.backend.auth.service.GoogleOAuthService;

@WebMvcTest(GoogleOAuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class GoogleOAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GoogleOAuthService googleOAuthService;

    @MockitoBean
    private AuthFlowProperties authFlowProperties;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void authorizeRedirectsToGoogleConsentScreen() throws Exception {
        when(authFlowProperties.authScreenUri())
            .thenReturn(Objects.requireNonNull("http://localhost:5173/auth"));

        when(googleOAuthService.buildAuthorizationRedirectUri(anyString()))
            .thenReturn(URI.create("https://accounts.google.com/o/oauth2/v2/auth?client_id=test&state=random"));

        mockMvc.perform(get("/api/auth/google/authorize"))
            .andExpect(status().isFound())
            .andExpect(header().string(
                "Location",
                "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&state=random"
            ));
    }

    @Test
    void callbackRedirectsToConfiguredPostAuthDestination() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("oauth2_state", "test-state");

        String email = "test@example.com";
        UserDetails userDetails = new User(
            Objects.requireNonNull(email),
            "",
            Collections.emptyList()
        );

        when(authFlowProperties.postAuthRedirectUri())
            .thenReturn(Objects.requireNonNull("http://localhost:5173/app"));

        when(googleOAuthService.handleGoogleCallback("auth-code"))
            .thenReturn(Objects.requireNonNull(email));

        when(userDetailsService.loadUserByUsername(Objects.requireNonNull(email)))
            .thenReturn(userDetails);

        mockMvc.perform(get("/api/auth/google/callback")
                .param("code", "auth-code")
                .param("state", "test-state")
                .session(session))
            .andExpect(status().isFound())
            .andExpect(header().string("Location", "http://localhost:5173/app"));

        verify(googleOAuthService).handleGoogleCallback("auth-code");
        verify(userDetailsService).loadUserByUsername(email);
    }

    @Test
    void callbackRedirectsToAuthWithErrorOnStateMismatch() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("oauth2_state", "correct-state");

        when(authFlowProperties.authScreenUri())
            .thenReturn(Objects.requireNonNull("http://localhost:5173/auth"));

        mockMvc.perform(get("/api/auth/google/callback")
                .param("code", "auth-code")
                .param("state", "wrong-state")
                .session(session))
            .andExpect(status().isFound())
            .andExpect(header().string("Location", "http://localhost:5173/auth?error=PROVIDER_UNAVAILABLE"));
    }
}
