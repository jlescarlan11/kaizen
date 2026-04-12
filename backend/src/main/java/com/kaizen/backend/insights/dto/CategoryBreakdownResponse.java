package com.kaizen.backend.insights.dto;

import java.math.BigDecimal;
import java.util.List;

public record CategoryBreakdownResponse(
    List<CategoryEntry> categories
) {
    public record CategoryEntry(
        Long categoryId,
        String categoryName,
        BigDecimal total,
        long transactionCount,
        BigDecimal percentage
    ) {}
}
