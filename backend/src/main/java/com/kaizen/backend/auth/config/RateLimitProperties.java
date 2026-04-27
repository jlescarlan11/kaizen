package com.kaizen.backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.rate-limit")
public record RateLimitProperties(
    int authPostCapacity,
    int authPostRefillPeriodSeconds
) {
    public RateLimitProperties {
        if (authPostCapacity <= 0) authPostCapacity = 10;
        if (authPostRefillPeriodSeconds <= 0) authPostRefillPeriodSeconds = 60;
    }
}
