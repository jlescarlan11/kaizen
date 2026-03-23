package com.kaizen.backend.common.dto;

import java.util.List;

/**
 * Standardized response payload returned for validation failures.
 */
public record ValidationErrorResponse(
    String code,
    String message,
    List<ValidationError> errors,
    String traceId
) {}
