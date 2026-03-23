package com.kaizen.backend.user.dto;

import jakarta.validation.constraints.NotNull;

public record BudgetSetupSkipRequest(
    @NotNull(message = "Skip preference is required.")
    Boolean skip
) {}
