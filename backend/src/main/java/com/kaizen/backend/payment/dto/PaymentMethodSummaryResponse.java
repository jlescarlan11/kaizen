package com.kaizen.backend.payment.dto;

import java.math.BigDecimal;

public record PaymentMethodSummaryResponse(
    PaymentMethodResponse paymentMethod, // null for "Unspecified"
    BigDecimal totalAmount
) {}
