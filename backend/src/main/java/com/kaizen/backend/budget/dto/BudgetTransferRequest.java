package com.kaizen.backend.budget.dto;

import com.kaizen.backend.budget.entity.BudgetPeriod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record BudgetTransferRequest(
    @NotNull BudgetPeriod source,
    @NotNull BudgetPeriod target,
    @NotNull @Positive BigDecimal amount
) {}
