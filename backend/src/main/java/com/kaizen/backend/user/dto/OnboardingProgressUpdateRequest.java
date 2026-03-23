package com.kaizen.backend.user.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.kaizen.backend.user.entity.OnboardingStep;

import jakarta.validation.constraints.NotNull;

public record OnboardingProgressUpdateRequest(
    @NotNull(message = "currentStep is required.")
    OnboardingStep currentStep,
    @JsonAlias("balanceValue")
    BigDecimal startingFunds,
    String fundingSourceType
) {}
