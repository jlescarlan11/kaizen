package com.kaizen.backend.budget.dto;

import com.kaizen.backend.budget.entity.BudgetPeriod;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import com.kaizen.backend.common.constants.ValidationConstants;

public record BudgetCreateRequest(
    @NotNull(message = "Category reference is required.")
    Long categoryId,
    @NotNull(message = ValidationConstants.BUDGET_AMOUNT_REQUIRED_ERROR)
    BigDecimal amount,
    @NotNull(message = "Budget period is required.")
    BudgetPeriod period
) {}
