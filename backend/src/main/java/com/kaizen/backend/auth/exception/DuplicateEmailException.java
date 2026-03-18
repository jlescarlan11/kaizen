package com.kaizen.backend.auth.exception;

import com.kaizen.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends ApiException {

    public DuplicateEmailException() {
        super(
            "DUPLICATE_EMAIL",
            "An account with that email already exists. Please log in instead.",
            HttpStatus.CONFLICT
        );
    }
}
