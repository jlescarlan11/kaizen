package com.kaizen.backend.config;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.kaizen.backend.common.constants.ValidationConstants;

/**
 * Configurable validation boundaries referenced by the onboarding validation layer.
 */
@Component
@ConfigurationProperties(prefix = "app.validation")
public class ValidationProperties {

    private BigDecimal maxBalanceValue = new BigDecimal(ValidationConstants.MAX_BALANCE_VALUE);

    /**
     * Toggle for enforcing budget-to-balance constraints.
     * TODO: Confirm applicability of restricted mode (PRD Open Question 2).
     */
    private boolean budgetBalanceConstraintEnabled = ValidationConstants.BUDGET_BALANCE_CONSTRAINT_ENABLED;

    public BigDecimal getMaxBalanceValue() {
        return maxBalanceValue;
    }

    public void setMaxBalanceValue(BigDecimal maxBalanceValue) {
        if (maxBalanceValue != null) {
            this.maxBalanceValue = maxBalanceValue;
        }
    }

    public boolean isBudgetBalanceConstraintEnabled() {
        return budgetBalanceConstraintEnabled;
    }

    public void setBudgetBalanceConstraintEnabled(boolean budgetBalanceConstraintEnabled) {
        this.budgetBalanceConstraintEnabled = budgetBalanceConstraintEnabled;
    }
}
