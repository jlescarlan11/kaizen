package com.kaizen.backend.category.exception;

import com.kaizen.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class CategoryNotFoundException extends ApiException {

    public CategoryNotFoundException() {
        super(
            "CATEGORY_NOT_FOUND",
            "Category not found.",
            HttpStatus.NOT_FOUND
        );
    }
}
