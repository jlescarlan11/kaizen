package com.kaizen.backend.common.exception;

import com.kaizen.backend.common.dto.ErrorResponse;
import java.util.Collections;
import java.util.Objects;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(@NonNull ApiException exception) {
        log.error("API Exception: {} (Code: {})", exception.getMessage(), exception.getCode(), exception);
        ErrorResponse response = new ErrorResponse(
            exception.getCode(),
            exception.getMessage(),
            exception.getDetails(),
            generateTraceId()
        );

        return ResponseEntity.status(exception.getStatus()).body(response);
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
