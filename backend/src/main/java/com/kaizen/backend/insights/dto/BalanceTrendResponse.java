package com.kaizen.backend.insights.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BalanceTrendResponse(
    List<TrendEntry> series
) {
    public record TrendEntry(
        LocalDate periodStart,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal netBalance
    ) {}
}
