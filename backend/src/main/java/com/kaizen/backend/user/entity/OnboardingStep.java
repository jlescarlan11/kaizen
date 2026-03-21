package com.kaizen.backend.user.entity;

/**
 * Represents the durable onboarding step tracker used by {@link OnboardingProgress}.
 * The enum values are intentionally sparse until the complete step list is confirmed.
 * Additional entries must be added in consultation with PRD Open Question 3.
 */
public enum OnboardingStep {

    BALANCE,
    BUDGET,
    COMPLETE;

    // Placeholder slots for future steps (PRD Open Question 3) can be added here.
}
