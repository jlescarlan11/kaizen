package com.kaizen.backend.category.exception;

import com.kaizen.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class DuplicateCategoryException extends ApiException {

    public DuplicateCategoryException() {
        super(
            "DUPLICATE_CATEGORY",
            "A category with that name already exists in your workspace.",
            HttpStatus.CONFLICT
        );
    }
}
