package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import com.kaizen.backend.common.constants.ValidationConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for updating the registered balance outside of onboarding.
 */
public record BalanceUpdateRequest(
    @NotNull(message = "Balance is required.")
    @DecimalMin(value = "0.0", message = ValidationConstants.BALANCE_NEGATIVE_ERROR)
    @DecimalMax(value = ValidationConstants.MAX_BALANCE_LIMIT_STR, message = ValidationConstants.BALANCE_MAX_LIMIT_ERROR)
    BigDecimal openingBalance
) {}
