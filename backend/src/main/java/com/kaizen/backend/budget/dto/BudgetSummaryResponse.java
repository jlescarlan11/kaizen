package com.kaizen.backend.budget.dto;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
    BigDecimal balance,
    BigDecimal availableMonthly,
    BigDecimal availableWeekly,
    BigDecimal totalAllocated,
    BigDecimal totalSpent,
    BigDecimal remainingToAllocate,
    int allocationPercentage,
    long budgetCount
) {
    public BudgetSummaryResponse(
        BigDecimal balance,
        BigDecimal totalAllocated,
        BigDecimal totalSpent,
        BigDecimal remainingToAllocate,
        int allocationPercentage,
        long budgetCount
    ) {
        this(balance, BigDecimal.ZERO, BigDecimal.ZERO, totalAllocated, totalSpent, remainingToAllocate, allocationPercentage, budgetCount);
    }
}
