package com.kaizen.backend.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.lang.NonNull;
import java.util.List;

public record BudgetBatchRequest(
    @NotEmpty(message = "At least one budget must be provided.")
    @NonNull
    List<@Valid BudgetCreateRequest> budgets
) {}
