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
     * TODO: Confirm this ceiling value with the product author. (PRD Open Question 1)
     */
    public static final String MAX_BALANCE_VALUE = "999999999999.99"; // Placeholder: Requires author confirmation.

    /**
     * Error copy needs UX/copy review before shipping.
     */
    public static final String BALANCE_REQUIRED_ERROR = "Starting funds are required.";

    public static final String BALANCE_POSITIVE_ERROR = "Starting funds must be greater than zero.";

    public static final String BALANCE_MAX_LIMIT_ERROR = "Balance exceeds the maximum allowable amount.";

    public static final String FUNDING_SOURCE_REQUIRED_ERROR = "Funding source is required.";

    public static final String FUNDING_SOURCE_INVALID_ERROR = "Funding source must be one of CASH_ON_HAND, BANK_ACCOUNT, or E_WALLET.";

    public static final String BUDGET_AMOUNT_REQUIRED_ERROR = "Budget amount is required.";

    public static final String BUDGET_AMOUNT_POSITIVE_ERROR = "Budget amount must be greater than zero.";

    public static final String BUDGET_OVER_BALANCE_ERROR = "Budget amount exceeds your available balance.";

    public static final String BUDGET_TOTAL_OVER_BALANCE_ERROR = "Combined budget amounts exceed your available balance.";

    public static final String CATEGORY_NOT_FOUND_ERROR = "Selected category does not exist.";

    public static final String CATEGORY_UNAVAILABLE_ERROR = "Category is not available for this user.";

    public static final String DUPLICATE_CATEGORY_ERROR = "Category appears more than once in the request.";

    /**
     * Default toggle for enforcing balance-based budget constraints.
     *
     * TODO: Confirm the restricted-mode behavior. (PRD Open Question 2)
     */
    public static final boolean BUDGET_BALANCE_CONSTRAINT_ENABLED = true;
}
