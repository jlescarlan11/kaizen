package com.kaizen.backend.common.constants;

/**
 * Common validation constants for the Kaizen backend.
 */
public final class ValidationConstants {

    private ValidationConstants() {
        // Prevent instantiation
    }

    /**
     * Maximum allowable balance value.
     * 
     * TODO: Confirm the maximum allowable balance value with the product author. (PRD Open Question 5)
     */
    public static final String MAX_BALANCE_LIMIT_STR = "999999999999.99"; // Placeholder: Requires author confirmation.

    /**
     * Error message for negative balance rejection.
     * 
     * Proposing placeholder copy; requires UX/copy review.
     */
    public static final String BALANCE_NEGATIVE_ERROR = "Balance cannot be negative.";

    /**
     * Error message for maximum balance limit exceeded.
     * 
     * Proposing placeholder copy; requires UX/copy review.
     */
    public static final String BALANCE_MAX_LIMIT_ERROR = "Balance exceeds the maximum allowable amount.";
}
