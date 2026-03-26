package com.kaizen.backend.transaction.dto;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;

public record BulkDeleteRequest(
    @NotEmpty(message = "Transaction IDs cannot be empty.")
    List<Long> ids
) {}
