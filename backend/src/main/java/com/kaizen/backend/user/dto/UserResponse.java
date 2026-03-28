package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import lombok.Builder;

@Builder
public record UserResponse(
    Long id,
    String name,
    String email,
    String picture,
    boolean onboardingCompleted,
    BigDecimal balance,
    boolean budgetSetupSkipped,
    boolean tourCompleted,
    boolean firstTransactionAdded,
    String quickAddPreferences,
    boolean remindersEnabled
) {
}
