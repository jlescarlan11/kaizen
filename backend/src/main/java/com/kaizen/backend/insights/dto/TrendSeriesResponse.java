package com.kaizen.backend.insights.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TrendSeriesResponse(
    List<TrendEntry> series
) {
    public record TrendEntry(
        LocalDate periodStart,
        BigDecimal total
    ) {}
}
