package com.kaizen.backend.budget.dto;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
    BigDecimal balance,
    BigDecimal totalAllocated,
    BigDecimal totalSpent,
    BigDecimal unallocated,
    int allocationPercentage,
    long budgetCount
) {}
