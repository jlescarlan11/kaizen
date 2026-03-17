package com.kaizen.backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

@ConfigurationProperties(prefix = "app.auth.google")
public record GoogleOAuthProperties(
    @NonNull String clientId,
    @NonNull String clientSecret,
    @NonNull String redirectUri,
    @NonNull String authorizationUri,
    @NonNull String tokenUri,
    @NonNull String userInfoUri
) {
}
