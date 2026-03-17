package com.kaizen.backend.auth.service;

import java.net.URI;
import java.util.Objects;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.kaizen.backend.auth.config.GoogleOAuthProperties;
import com.kaizen.backend.auth.dto.GoogleTokenResponse;
import com.kaizen.backend.auth.dto.GoogleUserInfoResponse;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
public class GoogleOAuthService {

    private static final String GOOGLE_PROVIDER_NAME = "google";
    private static final String GOOGLE_SCOPE = "openid profile email";

    private final GoogleOAuthProperties googleOAuthProperties;
    private final OAuthTokenCipher oAuthTokenCipher;
    private final RestClient restClient;
    private final UserAccountRepository userAccountRepository;

    public GoogleOAuthService(
        GoogleOAuthProperties googleOAuthProperties,
        OAuthTokenCipher oAuthTokenCipher,
        RestClient.Builder restClientBuilder,
        UserAccountRepository userAccountRepository
    ) {
        this.googleOAuthProperties = googleOAuthProperties;
        this.oAuthTokenCipher = oAuthTokenCipher;
        this.restClient = restClientBuilder.build();
        this.userAccountRepository = userAccountRepository;
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
    public String handleGoogleCallback(@NonNull String authorizationCode) {
        GoogleTokenResponse tokenResponse = exchangeAuthorizationCode(authorizationCode);
        GoogleUserInfoResponse userInfoResponse = fetchUserInfo(
            Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
        );

        String email = Objects.requireNonNull(userInfoResponse.email(), "email must not be null");

        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(email)
            .map(existing -> {
                // Update existing user with latest social info
                existing.setProviderName(GOOGLE_PROVIDER_NAME);
                existing.setProviderUserId(userInfoResponse.subject());
                existing.setEncryptedAccessToken(oAuthTokenCipher.encrypt(
                    Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
                ));
                existing.setEncryptedRefreshToken(oAuthTokenCipher.encryptNullable(tokenResponse.refreshToken()));
                return existing;
            })
            .orElseGet(() -> new UserAccount(
                userInfoResponse.name(),
                email,
                GOOGLE_PROVIDER_NAME,
                userInfoResponse.subject(),
                null,
                oAuthTokenCipher.encrypt(
                    Objects.requireNonNull(tokenResponse.accessToken(), "accessToken must not be null")
                ),
                oAuthTokenCipher.encryptNullable(tokenResponse.refreshToken())
            ));

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