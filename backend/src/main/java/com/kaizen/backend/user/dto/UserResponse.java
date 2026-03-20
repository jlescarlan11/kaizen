package com.kaizen.backend.user.dto;

import java.math.BigDecimal;

public record UserResponse(
    Long id,
    String name,
    String email,
    String picture,
    boolean onboardingCompleted,
    BigDecimal openingBalance
) {
}
