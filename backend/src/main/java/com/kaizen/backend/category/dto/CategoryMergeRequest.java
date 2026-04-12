package com.kaizen.backend.category.dto;

import jakarta.validation.constraints.NotNull;

public record CategoryMergeRequest(
    @NotNull(message = "Source category ID is required.")
    Long sourceId,

    @NotNull(message = "Target category ID is required.")
    Long targetId
) {}
