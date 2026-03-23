package com.kaizen.backend.user.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.auth.config.SessionProperties;
import com.kaizen.backend.auth.service.PersistentSessionService;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.user.dto.BudgetSetupSkipRequest;
import com.kaizen.backend.user.dto.OnboardingRequest;
import com.kaizen.backend.user.dto.UserProfileResponse;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.service.UserAccountService;
import com.kaizen.backend.user.validation.OnboardingInputValidator;

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
    private final OnboardingInputValidator onboardingInputValidator;

    public UserAccountController(
            UserAccountService userAccountService, 
            PersistentSessionService persistentSessionService,
            SessionProperties sessionProperties,
            OnboardingInputValidator onboardingInputValidator) {
        this.userAccountService = userAccountService;
        this.persistentSessionService = persistentSessionService;
        this.sessionProperties = sessionProperties;
        this.onboardingInputValidator = onboardingInputValidator;
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
        description = "Stores the user's starting funds and initial funding source, marks onboarding as completed, and issues or refreshes the persistent session token.",
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
            content = @Content(schema = @Schema(implementation = ValidationErrorResponse.class))
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
        
        onboardingInputValidator.validate(request);
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
        summary = "Record budget setup skip preference",
        description = "Stores the skip preference on the authenticated user's account so the dashboard knows to show deferred setup messaging.",
        operationId = "skipBudgetSetup"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Skip preference recorded successfully.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid skip payload.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User profile not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PutMapping("/skip")
    public UserResponse skipBudgetSetup(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody BudgetSetupSkipRequest request
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.updateBudgetSetupSkipPreference(userDetails.getUsername(), request.skip());
    }

    @Operation(
        summary = "Mark tour completed",
        description = "Sets the tourCompleted flag to true for the current user.",
        operationId = "markTourCompleted"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Flag updated successfully.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/flags/tour/completed")
    public UserResponse markTourCompleted(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.markTourCompleted(userDetails.getUsername());
    }

    @Operation(
        summary = "Reset tour flag",
        description = "Sets the tourCompleted flag to false for the current user (Show tour again).",
        operationId = "resetTourFlag"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Flag reset successfully.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/flags/tour/reset")
    public UserResponse resetTourFlag(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.resetTourFlag(userDetails.getUsername());
    }

    @Operation(
        summary = "Mark first transaction added",
        description = "Records that the user has added their first transaction.",
        operationId = "markFirstTransactionAdded"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Flag updated successfully.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/flags/first-transaction")
    public UserResponse markFirstTransactionAdded(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.markFirstTransactionAdded(userDetails.getUsername());
    }

    @Operation(
        summary = "Reset onboarding (DEV ONLY)",
        description = "Resets the user's onboarding state, deletes budgets and progress. For development/testing purposes.",
        operationId = "resetOnboarding"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Onboarding reset successfully.",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/onboarding/reset")
    public UserResponse resetOnboarding(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        return userAccountService.resetOnboarding(userDetails.getUsername());
    }
}
