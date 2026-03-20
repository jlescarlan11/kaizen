package com.kaizen.backend.user.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.auth.config.SessionProperties;
import com.kaizen.backend.auth.service.PersistentSessionService;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.user.dto.BalanceUpdateRequest;
import com.kaizen.backend.user.dto.OnboardingRequest;
import com.kaizen.backend.user.dto.UserProfileResponse;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.service.UserAccountService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@Tag(name = "User", description = "User account management.")
@RestController
@RequestMapping("/api/users")
public class UserAccountController {

    private final UserAccountService userAccountService;
    private final PersistentSessionService persistentSessionService;
    private final SessionProperties sessionProperties;

    public UserAccountController(
            UserAccountService userAccountService, 
            PersistentSessionService persistentSessionService,
            SessionProperties sessionProperties) {
        this.userAccountService = userAccountService;
        this.persistentSessionService = persistentSessionService;
        this.sessionProperties = sessionProperties;
    }

    @Operation(
        summary = "Get current authenticated user",
        description = "Returns the profile of the currently authenticated user.",
        operationId = "getMe"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved user profile.",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User profile not found or unauthenticated access.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }
        return userAccountService.getProfileByEmail(userDetails.getUsername());
    }

    @Operation(
        summary = "Complete onboarding",
        description = "Sets the initial balance and marks onboarding as completed for the current user. Also issues/refreshes the persistent session token.",
        operationId = "completeOnboarding"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Onboarding completed successfully and persistent session issued.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/onboarding")
    public ResponseEntity<UserResponse> completeOnboarding(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody OnboardingRequest request,
        HttpServletRequest servletRequest
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }
        
        String email = userDetails.getUsername();
        UserResponse userResponse = userAccountService.completeOnboarding(email, request);
        
        // Issue/Refresh persistent session token at onboarding completion
        String persistentToken = persistentSessionService.createSession(email);
        
        ResponseCookie cookie = ResponseCookie.from(sessionProperties.cookieName(), persistentToken)
            .httpOnly(true)
            .secure(servletRequest.isSecure())
            .path("/")
            .maxAge(persistentSessionService.getSessionExpirySeconds())
            .sameSite("Lax")
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(userResponse);
    }

    @Operation(
        summary = "Update authenticated user's balance",
        description = "Allows an authenticated user to update their stored balance after onboarding.",
        operationId = "updateBalance"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Balance updated and profile refreshed.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid balance value.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User profile not found or unauthenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PutMapping("/balance")
    public UserResponse updateBalance(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody BalanceUpdateRequest request
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.updateBalance(userDetails.getUsername(), request);
    }
}
