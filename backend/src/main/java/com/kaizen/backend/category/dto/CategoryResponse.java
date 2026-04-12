package com.kaizen.backend.category.dto;

import com.kaizen.backend.common.entity.TransactionType;

public record CategoryResponse(
    Long id,
    String name,
    boolean isGlobal,
    String icon,
    String color,
    TransactionType type
) {
}

