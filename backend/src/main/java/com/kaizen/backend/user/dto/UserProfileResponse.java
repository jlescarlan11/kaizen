package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record UserProfileResponse(
    Long id,
    String name,
    String email,
    String picture,
    Instant createdAt,
    boolean onboardingCompleted,
    BigDecimal balance,
    boolean budgetSetupSkipped,
    boolean tourCompleted,
    boolean firstTransactionAdded,
    String quickAddPreferences
) {
}
