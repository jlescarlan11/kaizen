package com.kaizen.backend.transaction.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record BalanceHistoryResponse(
    List<BalanceHistoryEntry> history
) {
    public record BalanceHistoryEntry(
        OffsetDateTime date,
        BigDecimal balance,
        String eventDescription,
        Long transactionId,
        String transactionType
    ) {}
}
