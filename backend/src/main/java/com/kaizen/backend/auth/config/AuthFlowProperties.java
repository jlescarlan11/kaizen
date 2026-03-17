package com.kaizen.backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

@ConfigurationProperties(prefix = "app.auth")
public record AuthFlowProperties(
    @NonNull String postSignupRedirectUri,
    @NonNull String signupScreenUri,
    @NonNull String tokenEncryptionKeyBase64
) {
}
