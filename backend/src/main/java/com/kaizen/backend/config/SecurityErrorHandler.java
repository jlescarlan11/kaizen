package com.kaizen.backend.config;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.logging.SecurityAuditLogger;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Sanitized Error Response Handler for Authentication and Authorization failures.
 * Ensures HTTP 401 and 403 responses contain no data leakage or stack traces.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;
    private final SecurityAuditLogger auditLogger;

    /**
     * Handles HTTP 401 Unauthorized responses.
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        log.debug("Unauthorized access attempt: {}", authException.getMessage());
        
        // High-level reason permitted by author: "expired" vs "invalid"
        String reason = (String) request.getAttribute("KZN_AUTH_FAILURE_REASON");
        String message = (reason != null && !reason.isBlank()) ? reason : "UNAUTHORIZED";
        
        // Record structured log entry for authentication failure
        auditLogger.logAuthenticationFailure(request, message);
        
        writeSanitizedError(response, HttpStatus.UNAUTHORIZED, "AUTH_FAILURE", message);
    }

    /**
     * Handles HTTP 403 Forbidden responses.
     */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // If the user is anonymous, treat it as an authentication failure (401)
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            log.debug("Anonymous access to protected resource - redirecting to 401");
            commence(request, response, new AuthenticationException(accessDeniedException.getMessage(), accessDeniedException) {});
            return;
        }

        log.debug("Forbidden access attempt for user {}: {}", authentication.getName(), accessDeniedException.getMessage());
        
        // Record structured log entry for authorization failure
        auditLogger.logAuthorizationFailure(request, "Insufficient permissions");
        
        writeSanitizedError(response, HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Insufficient permissions");
    }

    private void writeSanitizedError(HttpServletResponse response, HttpStatus status, String code, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // No data payload, no stack traces, no internal field names, no partial records.
        ErrorResponse errorResponse = new ErrorResponse(
            code,
            message,
            Collections.emptyMap(), // Empty details
            UUID.randomUUID().toString().replace("-", "") // Fresh trace ID
        );
        
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
