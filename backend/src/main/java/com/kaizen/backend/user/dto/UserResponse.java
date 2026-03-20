package com.kaizen.backend.user.dto;

public record UserResponse(
    Long id,
    String name,
    String email,
    String picture
) {
}
