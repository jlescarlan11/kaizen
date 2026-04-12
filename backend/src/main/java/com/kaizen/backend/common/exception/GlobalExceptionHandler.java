package com.kaizen.backend.common.exception;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.dto.ValidationError;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.common.logging.SecurityAuditLogger;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValidException(
            @NonNull MethodArgumentNotValidException exception) {
        log.error("Validation Exception: {}", exception.getMessage());

        List<ValidationError> errors = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> {
                    String code = "VALIDATION_ERROR";
                    if ("NotNull".equals(error.getCode()))
                        code = "REQUIRED";
                    else if ("DecimalMin".equals(error.getCode()))
                        code = "AMOUNT_POSITIVE";
                    else if ("PastOrPresent".equals(error.getCode()))
                        code = "FUTURE_DATE_REJECT";

                    return new ValidationError(error.getField(), error.getDefaultMessage(), code);
                })
                .collect(Collectors.toList());

        ValidationErrorResponse response = new ValidationErrorResponse(
                "VALIDATION_FAILURE",
                "Input validation failed.",
                errors,
                generateTraceId());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ValidationErrorResponse> handleIllegalArgumentException(
            @NonNull IllegalArgumentException exception) {
        log.error("Illegal Argument Exception: {}", exception.getMessage());

        // We can check the message to map to a specific field if it's a known error
        String field = "form";
        String code = "BAD_REQUEST";
        String message = exception.getMessage();

        if (message.contains("Amount")) {
            field = "amount";
            if (message.contains("required"))
                code = "REQUIRED";
            else if (message.contains("positive"))
                code = "AMOUNT_POSITIVE";
            else if (message.contains("decimal"))
                code = "AMOUNT_MAX_DECIMALS";
        } else if (message.contains("type")) {
            field = "type";
            if (message.contains("required"))
                code = "REQUIRED";
            else
                code = "TYPE_INVALID";
        } else if (message.contains("future")) {
            field = "transactionDate";
            code = "FUTURE_DATE_REJECT";
        } else if (message.contains("frequency")) {
            field = message.contains("unit") ? "frequencyUnit" : "frequencyMultiplier";
            code = message.contains("unit") ? "RECURRING_UNIT_REQUIRED" : "RECURRING_MULTIPLIER_POSITIVE";
        }

        ValidationErrorResponse response = new ValidationErrorResponse(
                "VALIDATION_FAILURE",
                "Input validation failed.",
                List.of(new ValidationError(field, message, code)),
                generateTraceId());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(@NonNull ValidationException exception) {
        log.error("Validation Exception: custom {}", exception.getMessage());

        ValidationErrorResponse response = new ValidationErrorResponse(
                "VALIDATION_FAILURE",
                "Input validation failed.",
                exception.getErrors(),
                generateTraceId());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(@NonNull ApiException exception,
            HttpServletRequest request) {
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
                generateTraceId());

        return ResponseEntity.status(exception.getStatus()).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(@NonNull AuthenticationException exception,
            HttpServletRequest request) {
        log.error("Authentication Exception: {}", exception.getMessage());

        auditLogger.logAuthenticationFailure(request, "UNAUTHORIZED");

        ErrorResponse response = new ErrorResponse(
                "AUTH_FAILURE",
                "Authentication failed",
                Collections.emptyMap(),
                generateTraceId());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(@NonNull AccessDeniedException exception,
            HttpServletRequest request) {
        log.error("Access Denied Exception: {}", exception.getMessage());

        auditLogger.logAuthorizationFailure(request, "Insufficient permissions");

        ErrorResponse response = new ErrorResponse(
                "ACCESS_DENIED",
                "Insufficient permissions",
                Collections.emptyMap(),
                generateTraceId());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(@NonNull Exception exception) {
        log.error("Unhandled Exception: {}", exception.getMessage(), exception);

        ErrorResponse response = new ErrorResponse(
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred.",
                Collections.emptyMap(),
                generateTraceId());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @NonNull
    private String generateTraceId() {
        return Objects.requireNonNull(UUID.randomUUID().toString().replace("-", ""));
    }
}
