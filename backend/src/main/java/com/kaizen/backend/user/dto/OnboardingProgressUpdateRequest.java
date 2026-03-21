package com.kaizen.backend.user.dto;

import java.math.BigDecimal;

import com.kaizen.backend.user.entity.OnboardingStep;

import jakarta.validation.constraints.NotNull;

public record OnboardingProgressUpdateRequest(
    @NotNull(message = "currentStep is required.")
    OnboardingStep currentStep,
    BigDecimal balanceValue,
    String budgetChoice
) {}
