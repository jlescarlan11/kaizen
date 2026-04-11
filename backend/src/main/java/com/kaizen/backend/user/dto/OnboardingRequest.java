package com.kaizen.backend.user.dto;

import java.time.OffsetDateTime;
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
        example = "1000.00"
    )
    BigDecimal startingFunds,

    @Schema(
        description = "The funding source that holds the starting funds.",
        example = "E_WALLET"
    )
    String fundingSourceType,

    @Valid
    @Schema(description = "Optional list of initial budgets to create.")
    List<BudgetCreateRequest> budgets,

    @Schema(description = "Optional description for the initial balance transaction.")
    String description,

    @Schema(description = "Optional notes for the initial balance transaction.")
    String notes,

    @Schema(description = "Optional payment method ID for the initial balance transaction.")
    Long paymentMethodId,

    @Schema(description = "Optional date for the initial balance transaction.")
    OffsetDateTime transactionDate,

    @Valid
    @Schema(description = "List of initial balances for different payment methods.")
    List<InitialBalanceRequest> initialBalances
) {
    public record InitialBalanceRequest(
        Long paymentMethodId,
        BigDecimal amount,
        String description,
        String notes,
        OffsetDateTime transactionDate
    ) {}
}
