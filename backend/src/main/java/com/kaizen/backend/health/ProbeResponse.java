package com.kaizen.backend.health;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Probe endpoint response payload.")
public record ProbeResponse(
    @Schema(description = "Current probe state.", example = "ok")
    String status
) {
}
