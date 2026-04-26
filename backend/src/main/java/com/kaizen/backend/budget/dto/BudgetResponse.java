package com.kaizen.backend.budget.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BudgetResponse(
    Long id,
    Long userId,
    Long categoryId,
    String categoryName,
    BigDecimal amount,
    BigDecimal expense,
    BigDecimal burnRate,
    BigDecimal dailyAllowance,
    BigDecimal projectedTotal,
    Integer daysElapsed,
    Integer daysLeft,
    BudgetPeriod period,
    Instant createdAt,
    Instant updatedAt
) {}
