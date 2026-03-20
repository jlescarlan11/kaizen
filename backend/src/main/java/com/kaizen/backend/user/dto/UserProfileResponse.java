package com.kaizen.backend.user.dto;

import java.time.Instant;

public record UserProfileResponse(
    Long id,
    String name,
    String email,
    String picture,
    Instant createdAt
) {
}
