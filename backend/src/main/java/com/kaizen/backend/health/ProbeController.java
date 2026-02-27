package com.kaizen.backend.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health", description = "Service health and probe endpoints.")
@RestController
@RequestMapping("/api")
public class ProbeController {

    @Operation(
        summary = "Get probe status",
        description = "Returns the probe status for authenticated clients.",
        operationId = "getProbeStatus",
        security = @SecurityRequirement(name = "basicAuth")
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Probe status returned.",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = ProbeResponse.class),
                examples = @ExampleObject(
                    name = "success",
                    value = "{\"status\":\"ok\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required.",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(
                    name = "unauthorized",
                    value = "{\"code\":\"AUTHENTICATION_REQUIRED\",\"message\":\"Authentication is required to access this resource.\",\"details\":{},\"traceId\":\"0af7651916cd43dd8448eb211c80319c\"}"
                )
            )
        )
    })
    @GetMapping(value = "/probe", produces = MediaType.APPLICATION_JSON_VALUE)
    public ProbeResponse probe() {
        return new ProbeResponse("ok");
    }
}
