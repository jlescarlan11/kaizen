package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

public record OnboardingRequest(
    @NotNull BigDecimal openingBalance
) {}
