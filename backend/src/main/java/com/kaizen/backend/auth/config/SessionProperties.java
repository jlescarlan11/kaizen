package com.kaizen.backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

/**
 * Configuration properties for session management.
 * 
 * PRD Open Question 3: The session expiry duration and reset behavior.
 * This is currently set to a default value and must be confirmed by the product author.
 */
@ConfigurationProperties(prefix = "app.auth.session")
public record SessionProperties(
    @NonNull Integer expiryDays,
    @NonNull String cookieName
) {
    // Default constructor for Spring Boot configuration
    public SessionProperties {
        if (expiryDays == null) {
            expiryDays = 90; // Default placeholder for PRD Open Question 3
        }
        if (cookieName == null) {
            cookieName = "kzn_pst";
        }
    }
}
