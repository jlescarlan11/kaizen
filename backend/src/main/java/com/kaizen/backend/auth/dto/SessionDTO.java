package com.kaizen.backend.auth.dto;

import java.time.Instant;

public record SessionDTO(
    Long id,
    Instant createdAt,
    Instant expiresAt,
    boolean isCurrent
) {}
