package com.kaizen.backend.common.logging;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Security Audit Logger for recording authentication and authorization failures.
 * Ensures structured, machine-readable logs without sensitive credential leakage.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityAuditLogger {

    private final ObjectMapper objectMapper;

    /**
     * Records an authentication failure (HTTP 401).
     * 
     * @param request The current HTTP request.
     * @param reason The reason for the authentication failure.
     */
    public void logAuthenticationFailure(HttpServletRequest request, String reason) {
        logSecurityEvent(request, 401, reason);
    }

    /**
     * Records an authorization failure (HTTP 403).
     * 
     * @param request The current HTTP request.
     * @param reason The reason for the authorization failure.
     */
    public void logAuthorizationFailure(HttpServletRequest request, String reason) {
        logSecurityEvent(request, 403, reason);
    }

    private void logSecurityEvent(HttpServletRequest request, int status, String reason) {
        // Prepare structured event data
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("timestamp", Instant.now().toString());
        event.put("event_type", status == 401 ? "AUTH_FAILURE" : "ACCESS_DENIED");
        event.put("status", status);
        event.put("path", request.getRequestURI());
        event.put("method", request.getMethod());
        event.put("reason", reason != null ? reason : "UNKNOWN");
        event.put("remote_ip", request.getRemoteAddr());
        
        // We explicitly omit any data from request.getCookies(), request.getHeader("Authorization"), etc.
        // to comply with the non-logging requirement for credentials.

        try {
            // Output as a single line prefixed with a marker for easy filtering
            log.warn("SECURITY_AUDIT: {}", objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            // Fallback to simple format if JSON serialization fails
            log.warn("SECURITY_AUDIT: [ERROR] status={}, path={}, reason={}", status, request.getRequestURI(), reason);
        }
    }
}
