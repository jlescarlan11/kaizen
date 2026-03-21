package com.kaizen.backend.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BudgetBatchRequest(
    @NotEmpty(message = "At least one budget must be provided.")
    List<@Valid BudgetCreateRequest> budgets
) {}
