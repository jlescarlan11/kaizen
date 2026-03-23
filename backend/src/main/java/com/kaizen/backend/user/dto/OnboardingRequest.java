package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.kaizen.backend.budget.dto.BudgetCreateRequest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;

public record OnboardingRequest(
    @JsonAlias("balance")
    @Schema(
        description = "The user's current available money at the start of onboarding.",
        example = "1000.00",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    BigDecimal startingFunds,

    @Schema(
        description = "The funding source that holds the starting funds.",
        example = "E_WALLET",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    String fundingSourceType,

    @Valid
    @Schema(description = "Optional list of initial budgets to create.")
    List<BudgetCreateRequest> budgets
) {
}
