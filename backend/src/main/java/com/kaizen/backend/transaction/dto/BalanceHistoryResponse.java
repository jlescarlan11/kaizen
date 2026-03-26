package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BalanceHistoryResponse(
    List<BalanceHistoryEntry> history
) {
    public record BalanceHistoryEntry(
        LocalDateTime date,
        BigDecimal balance,
        String eventDescription,
        Long transactionId,
        String transactionType
    ) {}
}
