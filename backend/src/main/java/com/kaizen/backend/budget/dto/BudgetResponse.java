package com.kaizen.backend.budget.dto;

import com.kaizen.backend.budget.entity.BudgetPeriod;
import java.math.BigDecimal;
import java.time.Instant;

public record BudgetResponse(
    Long id,
    Long userId,
    Long categoryId,
    String categoryName,
    BigDecimal amount,
    BudgetPeriod period,
    Instant createdAt,
    Instant updatedAt
) {}
