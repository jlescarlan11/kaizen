package com.kaizen.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "app.security.user")
public record AppSecurityProperties(
    @NotBlank String name,
    @NotBlank String password
) {
}
