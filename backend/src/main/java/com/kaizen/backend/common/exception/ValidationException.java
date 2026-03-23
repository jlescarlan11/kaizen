package com.kaizen.backend.common.exception;

import com.kaizen.backend.common.dto.ValidationError;
import java.util.List;

/**
 * Exception used internally to short-circuit onboarding validation failures.
 */
public class ValidationException extends RuntimeException {

    private final List<ValidationError> errors;

    public ValidationException(List<ValidationError> errors) {
        super("Validation failed");
        this.errors = errors;
    }

    public List<ValidationError> getErrors() {
        return errors;
    }
}
