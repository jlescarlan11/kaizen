package com.kaizen.backend.payment.dto;

public record PaymentMethodResponse(
    Long id,
    String name,
    boolean isGlobal
) {}
