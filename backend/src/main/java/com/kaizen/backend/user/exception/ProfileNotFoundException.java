package com.kaizen.backend.user.exception;

import com.kaizen.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a user profile is not found or when unauthenticated
 * access is rejected without exposing the resource's existence.
 */
public class ProfileNotFoundException extends ApiException {

    public ProfileNotFoundException() {
        super("NOT_FOUND", "Resource not found", HttpStatus.NOT_FOUND);
    }

    public ProfileNotFoundException(String message) {
        super("NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }
}
