package com.kaizen.backend.auth.service;

import java.net.URI;
import java.util.Objects;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import org.springframework.web.client.RestClient;

import com.kaizen.backend.auth.config.GoogleOAuthProperties;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthServiceTest {

    private GoogleOAuthService googleOAuthService;

    @Mock
    private GoogleOAuthProperties googleOAuthProperties;

    @Mock
    private OAuthTokenCipher oAuthTokenCipher;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private RoleRepository roleRepository;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();

        googleOAuthService = new GoogleOAuthService(
            googleOAuthProperties,
            oAuthTokenCipher,
            builder,
            userAccountRepository,
            roleRepository
        );
    }

    @Test
    void buildsCorrectAuthorizationUri() {
        when(googleOAuthProperties.authorizationUri()).thenReturn("https://accounts.google.com/o/oauth2/v2/auth");
        when(googleOAuthProperties.clientId()).thenReturn("test-client-id");
        when(googleOAuthProperties.redirectUri()).thenReturn("http://localhost:8080/callback");

        String state = "test-state";
        URI uri = googleOAuthService.buildAuthorizationRedirectUri(state);

        assertNotNull(uri);
        String uriString = uri.toString();
        assertTrue(uriString.contains("https://accounts.google.com/o/oauth2/v2/auth"));
        assertTrue(uriString.contains("client_id=test-client-id"));
        assertTrue(uriString.contains("redirect_uri=http://localhost:8080/callback"));
        assertTrue(uriString.contains("response_type=code"));
        assertTrue(uriString.contains("scope=openid%20profile%20email"));
        assertTrue(uriString.contains("state=test-state"));
    }

    @Test
    void handlesCallbackSuccessfully() {
        String authCode = "test-auth-code";
        String accessToken = "test-access-token";
        String refreshToken = "test-refresh-token";
        String email = "test@example.com";
        String name = "Test User";
        String subject = "google-sub-123";

        when(googleOAuthProperties.tokenUri()).thenReturn("https://oauth2.googleapis.com/token");
        when(googleOAuthProperties.userInfoUri()).thenReturn("https://www.googleapis.com/oauth2/v3/userinfo");
        
        when(oAuthTokenCipher.encrypt(accessToken)).thenReturn("encrypted-access-token");
        when(oAuthTokenCipher.encryptNullable(refreshToken)).thenReturn("encrypted-refresh-token");
        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(new Role("USER")));

        // Mock Token Exchange
        mockServer.expect(requestTo("https://oauth2.googleapis.com/token"))
            .andExpect(method(Objects.requireNonNull(HttpMethod.POST)))
            .andRespond(withSuccess(
                "{\"access_token\":\"" + accessToken + "\", \"refresh_token\":\"" + refreshToken + "\"}",
                MediaType.APPLICATION_JSON
            ));

        // Mock User Info Fetch
        mockServer.expect(requestTo("https://www.googleapis.com/oauth2/v3/userinfo"))
            .andExpect(method(Objects.requireNonNull(HttpMethod.GET)))
            .andRespond(withSuccess(
                "{\"sub\":\"" + subject + "\", \"name\":\"" + name + "\", \"email\":\"" + email + "\"}",
                MediaType.APPLICATION_JSON
            ));

        String returnedEmail = googleOAuthService.handleGoogleCallback(authCode);

        assertEquals(email, returnedEmail);
        verify(userAccountRepository).save(any(UserAccount.class));
        mockServer.verify();
    }
}

