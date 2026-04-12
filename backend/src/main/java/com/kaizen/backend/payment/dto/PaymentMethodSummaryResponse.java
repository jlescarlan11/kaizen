package com.kaizen.backend.payment.dto;

import java.math.BigDecimal;
import java.util.List;

public record PaymentMethodSummaryResponse(
    PaymentMethodResponse paymentMethod, // null for "Unspecified"
    BigDecimal totalAmount,
    List<BigDecimal> last7Days
) {}
