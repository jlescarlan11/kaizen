package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.kaizen.backend.common.entity.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record TransactionRequest(
    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01.")
    BigDecimal amount,

    @NotNull(message = "Transaction type is required.")
    TransactionType type,

    LocalDateTime transactionDate,

    String description,

    Long categoryId,

    Long paymentMethodId,

    String notes,

    Boolean isRecurring,

    com.kaizen.backend.transaction.entity.FrequencyUnit frequencyUnit,

    Integer frequencyMultiplier,

    Long parentRecurringTransactionId,

    Boolean remindersEnabled
) {}
