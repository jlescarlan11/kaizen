package com.kaizen.backend.insights.dto;

import java.math.BigDecimal;

public record SpendingSummaryResponse(
    BigDecimal totalIncome,
    BigDecimal totalExpenses,
    BigDecimal netBalance
) {}
