package com.kaizen.backend.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleUserInfoResponse(
    @JsonProperty("sub") String subject,
    String name,
    String email
) {
}
