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
     * Override via {@code app.validation.budget-balance-constraint-enabled} in the environment-specific
     * configuration file when the restricted-mode behavior needs to differ from the default.
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
