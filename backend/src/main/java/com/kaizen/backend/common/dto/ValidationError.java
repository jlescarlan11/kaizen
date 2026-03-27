package com.kaizen.backend.common.dto;

/**
 * DTO describing a single validation issue, conforming to the { field, message, code } contract.
 */
public record ValidationError(String field, String message, String code) {
    public ValidationError(String field, String message) {
        this(field, message, "VALIDATION_ERROR");
    }
}
