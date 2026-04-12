package com.kaizen.backend.auth.service;

import java.net.URI;
import java.util.Objects;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.kaizen.backend.auth.config.GoogleOAuthProperties;
import com.kaizen.backend.auth.dto.GoogleTokenResponse;
import com.kaizen.backend.auth.dto.GoogleUserInfoResponse;
import com.kaizen.backend.user.entity.Role;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.RoleRepository;
import com.kaizen.backend.user.repository.UserAccountRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GoogleOAuthService {

    private static final String GOOGLE_PROVIDER_NAME = "google";
    private static final String GOOGLE_SCOPE = "openid profile email";
    private static final String GOOGLE_REVOCATION_URI = "https://oauth2.googleapis.com/revoke";
    private static final String DEFAULT_ROLE_NAME = "USER";

    private final GoogleOAuthProperties googleOAuthProperties;
    private final OAuthTokenCipher oAuthTokenCipher;
    private final RestClient restClient;
    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;

    public GoogleOAuthService(
        GoogleOAuthProperties googleOAuthProperties,
        OAuthTokenCipher oAuthTokenCipher,
        RestClient.Builder restClientBuilder,
        UserAccountRepository userAccountRepository,
        RoleRepository roleRepository
    ) {
        this.googleOAuthProperties = googleOAuthProperties;
        this.oAuthTokenCipher = oAuthTokenCipher;
        this.restClient = restClientBuilder.build();
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Decrypts and revokes all stored Google OAuth tokens for a given user email.
     * 
     * @param email The user's email.
     */
    @Transactional
    public void revokeTokens(String email) {
        userAccountRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            try {
                if (user.getEncryptedAccessToken() != null && !user.getEncryptedAccessToken().isBlank()) {
                    String accessToken = oAuthTokenCipher.decrypt(user.getEncryptedAccessToken());
                    revokeTokenAtProvider(accessToken);
                }
                if (user.getEncryptedRefreshToken() != null && !user.getEncryptedRefreshToken().isBlank()) {
                    String refreshToken = oAuthTokenCipher.decrypt(user.getEncryptedRefreshToken());
                    revokeTokenAtProvider(refreshToken);
                }
            } catch (Exception e) {
                log.warn("Failed to revoke Google tokens for user {}: {}", email, e.getMessage());
            }
        });
    }

private void revokeTokenAtProvider(String token) {
    MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
    formData.add("token", token);

    restClient.post()
        .uri(GOOGLE_REVOCATION_URI)
        .contentType(Objects.requireNonNull(MediaType.APPLICATION_FORM_URLENCODED))
        .body(formData)
        .retrieve()
        .toBodilessEntity();
}

    @NonNull
    public URI buildAuthorizationRedirectUri(@NonNull String state) {
        return UriComponentsBuilder
            .fromUriString(Objects.requireNonNull(
                googleOAuthProperties.authorizationUri(),
                "authorizationUri must not be null"
            ))
            .queryParam("client_id", Objects.requireNonNull(
                googleOAuthProperties.clientId(),
                "clientId must not be null"
            ))
            .queryParam("redirect_uri", Objects.requireNonNull(
                googleOAuthProperties.redirectUri(),
                "redirectUri must not be null"
            ))
            .queryParam("response_type", "code")
            .queryParam("scope", GOOGLE_SCOPE)
            .queryParam("access_type", "offline")
            .queryParam("include_granted_scopes", "true")
            .queryParam("state", state)
            .build()
            .toUri();
    }

    @NonNull
    @Transactional
    public String handleGoogleCallback(@NonNull String authorizationCode) {
        GoogleTokenResponse tokenResponse = exchangeAuthorizationCode(authorizationCode);
        GoogleUserInfoResponse userInfoResponse = fetchUserInfo(
            Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
        );

        log.info("Google User Info: email={}, name={}, picture={}", 
            userInfoResponse.email(), userInfoResponse.name(), userInfoResponse.picture());

        String email = Objects.requireNonNull(userInfoResponse.email(), "email must not be null");
        String providerUserId = userInfoResponse.subject();
        
        Role userRole = roleRepository.findByName(DEFAULT_ROLE_NAME)
            .orElseGet(() -> roleRepository.save(new Role(DEFAULT_ROLE_NAME)));

        // Try to find by provider identity first (robust against email changes)
        UserAccount userAccount = userAccountRepository.findByProviderNameAndProviderUserId(GOOGLE_PROVIDER_NAME, providerUserId)
            .or(() -> userAccountRepository.findByEmailIgnoreCase(email))
            .map(existing -> {
                // Update existing user with latest social info
                existing.setEmail(email); // Keep email in sync
                existing.setProviderName(GOOGLE_PROVIDER_NAME);
                existing.setProviderUserId(providerUserId);
                existing.setPictureUrl(userInfoResponse.picture());
                existing.setEncryptedAccessToken(oAuthTokenCipher.encrypt(
                    Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
                ));
                existing.setEncryptedRefreshToken(oAuthTokenCipher.encryptNullable(tokenResponse.refreshToken()));
                
                // Ensure the user has the default role
                if (existing.getRoles().stream().noneMatch(r -> r.getName().equals(DEFAULT_ROLE_NAME))) {
                    existing.addRole(userRole);
                }
                
                return existing;
            })
            .orElseGet(() -> {
                UserAccount newUser = new UserAccount(
                    userInfoResponse.name(),
                    email,
                    GOOGLE_PROVIDER_NAME,
                    providerUserId,
                    null,
                    userInfoResponse.picture(),
                    oAuthTokenCipher.encrypt(
                        Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
                    ),
                    oAuthTokenCipher.encryptNullable(tokenResponse.refreshToken())
                );
                newUser.addRole(userRole);
                return newUser;
            });

        userAccountRepository.save(Objects.requireNonNull(userAccount, "userAccount must not be null"));

        return email;
    }

    @NonNull
    private GoogleTokenResponse exchangeAuthorizationCode(String authorizationCode) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", googleOAuthProperties.clientId());
        formData.add("client_secret", googleOAuthProperties.clientSecret());
        formData.add("code", authorizationCode);
        formData.add("grant_type", "authorization_code");
        formData.add("redirect_uri", googleOAuthProperties.redirectUri());

        GoogleTokenResponse tokenResponse = restClient
    .post()
    .uri(Objects.requireNonNull(
    googleOAuthProperties.tokenUri(),
    "tokenUri must not be null"
))
    .contentType(Objects.requireNonNull(
        MediaType.APPLICATION_FORM_URLENCODED,
        "Form content type must not be null"
    ))
    .body(formData)
    .retrieve()
    .body(GoogleTokenResponse.class);

if (tokenResponse == null) {
    throw new IllegalStateException("Google token response must not be null");
}

return tokenResponse;
    }

    @NonNull
private GoogleUserInfoResponse fetchUserInfo(String accessToken) {
    GoogleUserInfoResponse userInfoResponse = restClient
        .get()
        .uri(Objects.requireNonNull(
    googleOAuthProperties.userInfoUri(),
    "userInfoUri must not be null"
))
        .headers(headers -> headers.setBearerAuth(
            Objects.requireNonNull(accessToken, "accessToken must not be null")
        ))
        .retrieve()
        .body(GoogleUserInfoResponse.class);

    if (userInfoResponse == null) {
        throw new IllegalStateException("Google user info response must not be null");
    }

    return userInfoResponse;
}
}