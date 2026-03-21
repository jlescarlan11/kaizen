package com.kaizen.backend.category.exception;

import com.kaizen.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidCategoryDesignException extends ApiException {

    public InvalidCategoryDesignException(String target, String message) {
        super(
            "INVALID_CATEGORY_DESIGN",
            String.format("Invalid category %s: %s", target, message),
            HttpStatus.BAD_REQUEST
        );
    }
}
