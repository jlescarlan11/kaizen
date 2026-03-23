package com.kaizen.backend.budget.dto;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
    BigDecimal balance,
    BigDecimal totalAllocated,
    BigDecimal remainingToAllocate,
    int allocationPercentage,
    long budgetCount
) {}
