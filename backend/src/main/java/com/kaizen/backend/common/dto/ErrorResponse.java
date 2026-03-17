package com.kaizen.backend.common.dto;

import java.util.Map;

public record ErrorResponse(
    String code,
    String message,
    Map<String, Object> details,
    String traceId
) {
}
