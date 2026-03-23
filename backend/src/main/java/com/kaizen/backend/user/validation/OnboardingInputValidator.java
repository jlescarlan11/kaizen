package com.kaizen.backend.user.validation;

import com.kaizen.backend.common.constants.ValidationConstants;
import com.kaizen.backend.common.dto.ValidationError;
import com.kaizen.backend.common.exception.ValidationException;
import com.kaizen.backend.config.ValidationProperties;
import com.kaizen.backend.user.dto.OnboardingRequest;
import com.kaizen.backend.user.entity.FundingSourceType;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class OnboardingInputValidator {

    private final ValidationProperties validationProperties;

    public OnboardingInputValidator(ValidationProperties validationProperties) {
        this.validationProperties = validationProperties;
    }

    public void validate(OnboardingRequest request) {
        List<ValidationError> errors = new ArrayList<>();
        BigDecimal startingFunds = request.startingFunds();

        if (startingFunds == null) {
            errors.add(new ValidationError("startingFunds", ValidationConstants.BALANCE_REQUIRED_ERROR));
        } else {
            if (startingFunds.compareTo(BigDecimal.ZERO) <= 0) {
                errors.add(new ValidationError("startingFunds", ValidationConstants.BALANCE_POSITIVE_ERROR));
            }
            if (startingFunds.compareTo(validationProperties.getMaxBalanceValue()) > 0) {
                errors.add(new ValidationError("startingFunds", ValidationConstants.BALANCE_MAX_LIMIT_ERROR));
            }
        }

        if (request.fundingSourceType() == null || request.fundingSourceType().isBlank()) {
            errors.add(new ValidationError("fundingSourceType", ValidationConstants.FUNDING_SOURCE_REQUIRED_ERROR));
        } else if (FundingSourceType.fromValue(request.fundingSourceType()).isEmpty()) {
            errors.add(new ValidationError("fundingSourceType", ValidationConstants.FUNDING_SOURCE_INVALID_ERROR));
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }
}
