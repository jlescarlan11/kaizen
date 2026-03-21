package com.kaizen.backend.budget.dto;

import com.kaizen.backend.budget.entity.BudgetPeriod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetCreateRequest(
    @NotNull(message = "Category reference is required.")
    Long categoryId,
    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than zero.")
    BigDecimal amount,
    @NotNull(message = "Budget period is required.")
    BudgetPeriod period
) {}
