package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import lombok.Builder;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Builder
public record TransactionResponse(
    Long id,
    BigDecimal amount,
    TransactionType type,
    OffsetDateTime transactionDate,
    String description,
    CategoryResponse category,
    PaymentMethodResponse paymentMethod,
    String notes,
    Boolean isRecurring,
    com.kaizen.backend.transaction.entity.FrequencyUnit frequencyUnit,
    Integer frequencyMultiplier,
    Boolean remindersEnabled,
    java.util.List<AttachmentResponse> attachments,
    String clientGeneratedId,
    Instant createdAt,
    Instant updatedAt
) {}
