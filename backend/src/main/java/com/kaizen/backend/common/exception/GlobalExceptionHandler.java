package com.kaizen.backend.common.exception;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.dto.ValidationError;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.common.exception.ApiException;
import com.kaizen.backend.common.exception.ValidationException;
import com.kaizen.backend.common.logging.SecurityAuditLogger;

/**
 * Global Exception Handler for the API.
 * Ensures consistent and sanitized error responses across the application.
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final SecurityAuditLogger auditLogger;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(@NonNull MethodArgumentNotValidException exception) {
        log.error("Validation Exception: {}", exception.getMessage());

        List<ValidationError> errors = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> new ValidationError(error.getField(), error.getDefaultMessage()))
            .collect(Collectors.toList());

        ValidationErrorResponse response = new ValidationErrorResponse(
            "VALIDATION_FAILURE",
            "Input validation failed.",
            errors,
            generateTraceId()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(@NonNull ValidationException exception) {
        log.error("Validation Exception: custom {}", exception.getMessage());

        ValidationErrorResponse response = new ValidationErrorResponse(
            "VALIDATION_FAILURE",
            "Input validation failed.",
            exception.getErrors(),
            generateTraceId()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(@NonNull ApiException exception, HttpServletRequest request) {
        log.error("API Exception: {} (Code: {})", exception.getMessage(), exception.getCode(), exception);
        
        // For 401 and 403, we enforce sanitization and audit logging.
        if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
            auditLogger.logAuthenticationFailure(request, exception.getCode());
        } else if (exception.getStatus() == HttpStatus.FORBIDDEN) {
            auditLogger.logAuthorizationFailure(request, "Insufficient permissions");
        }

        boolean isAuthError = exception.getStatus() == HttpStatus.UNAUTHORIZED || 
                             exception.getStatus() == HttpStatus.FORBIDDEN;

        ErrorResponse response = new ErrorResponse(
            exception.getCode(),
            exception.getMessage(),
            isAuthError ? Collections.emptyMap() : exception.getDetails(),
            generateTraceId()
        );

        return ResponseEntity.status(exception.getStatus()).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(@NonNull AuthenticationException exception, HttpServletRequest request) {
        log.error("Authentication Exception: {}", exception.getMessage());
        
        auditLogger.logAuthenticationFailure(request, "UNAUTHORIZED");

        ErrorResponse response = new ErrorResponse(
            "AUTH_FAILURE",
            "Authentication failed",
            Collections.emptyMap(),
            generateTraceId()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(@NonNull AccessDeniedException exception, HttpServletRequest request) {
        log.error("Access Denied Exception: {}", exception.getMessage());
        
        auditLogger.logAuthorizationFailure(request, "Insufficient permissions");

        ErrorResponse response = new ErrorResponse(
            "ACCESS_DENIED",
            "Insufficient permissions",
            Collections.emptyMap(),
            generateTraceId()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(@NonNull Exception exception) {
        log.error("Unhandled Exception: {}", exception.getMessage(), exception);
        
        ErrorResponse response = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred.",
            Collections.emptyMap(),
            generateTraceId()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @NonNull
    private String generateTraceId() {
        return Objects.requireNonNull(UUID.randomUUID().toString().replace("-", ""));
    }
}
