package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

public record ReconciliationRequest(
    @NotNull(message = "Real-world balance is required")
    BigDecimal realWorldBalance,
    String description
) {}
