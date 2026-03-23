package com.kaizen.backend.common.dto;

/**
 * DTO describing a single validation issue, conforming to the { field, message } contract.
 */
public record ValidationError(String field, String message) {}
