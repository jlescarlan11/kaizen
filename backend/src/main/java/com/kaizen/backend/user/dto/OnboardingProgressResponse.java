package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.kaizen.backend.user.entity.OnboardingProgress;
import com.kaizen.backend.user.entity.OnboardingStep;

public record OnboardingProgressResponse(
    OnboardingStep currentStep,
    BigDecimal startingFunds,
    String fundingSourceType,
    Instant lastUpdatedAt
) {

    public static OnboardingProgressResponse from(OnboardingProgress progress) {
        return new OnboardingProgressResponse(
            progress.getCurrentStep(),
            progress.getStartingFunds(),
            progress.getFundingSourceType() == null ? null : progress.getFundingSourceType().name(),
            progress.getUpdatedAt()
        );
    }
}
