package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;

public record TransactionResponse(
    Long id,
    BigDecimal amount,
    TransactionType type,
    LocalDateTime transactionDate,
    String description,
    CategoryResponse category,
    PaymentMethodResponse paymentMethod,
    Boolean reconciliationIncrease,
    String notes,
    Boolean isRecurring,
    com.kaizen.backend.transaction.entity.FrequencyUnit frequencyUnit,
    Integer frequencyMultiplier,
    Boolean remindersEnabled,
    java.util.List<AttachmentResponse> attachments
) {}
