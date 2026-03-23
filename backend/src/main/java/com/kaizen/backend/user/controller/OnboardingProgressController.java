package com.kaizen.backend.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.user.entity.FundingSourceType;
import com.kaizen.backend.user.dto.OnboardingProgressResponse;
import com.kaizen.backend.user.dto.OnboardingProgressUpdateRequest;
import com.kaizen.backend.user.entity.OnboardingProgress;
import com.kaizen.backend.user.entity.OnboardingStep;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import com.kaizen.backend.user.service.OnboardingProgressService;
import com.kaizen.backend.common.dto.ValidationError;
import com.kaizen.backend.common.exception.ValidationException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

/**
 * Provides the durable onboarding progress endpoints consumed during login.
 * <p>
 * Step to route mapping (Story 17):
 * <ul>
 *   <li>BALANCE → Budget step (onboarding step 2).</li>
 *   <li>BUDGET → Budget step (terminal screen before completion).</li>
 *   <li>COMPLETE → Main application (dashboard).</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/users/onboarding/progress")
public class OnboardingProgressController {

    private final OnboardingProgressService onboardingProgressService;
    private final UserAccountRepository userAccountRepository;

    public OnboardingProgressController(
        OnboardingProgressService onboardingProgressService,
        UserAccountRepository userAccountRepository
    ) {
        this.onboardingProgressService = onboardingProgressService;
        this.userAccountRepository = userAccountRepository;
    }

    @GetMapping
    public ResponseEntity<OnboardingProgressResponse> getProgress(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        UserAccount userAccount = userAccountRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(ProfileNotFoundException::new);

        return onboardingProgressService.findForUser(userAccount)
            .map(progress -> ResponseEntity.ok(OnboardingProgressResponse.from(progress)))
            .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public OnboardingProgressResponse updateProgress(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody OnboardingProgressUpdateRequest request
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        UserAccount userAccount = userAccountRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(ProfileNotFoundException::new);

        OnboardingProgress progress = onboardingProgressService.upsert(
            userAccount,
            request.currentStep(),
            request.startingFunds(),
            resolveFundingSourceType(request.fundingSourceType())
        );

        // Required to persist the UserAccount.balance set by the service
        userAccountRepository.save(userAccount);

        return OnboardingProgressResponse.from(progress);
    }

    @Operation(
        summary = "Delete onboarding progress",
        description = "Removes the durably persisted onboarding progress for the authenticated user."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Progress deleted successfully."),
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
    @DeleteMapping
    public ResponseEntity<Void> deleteProgress(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        UserAccount userAccount = userAccountRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(ProfileNotFoundException::new);

        onboardingProgressService.deleteForUser(userAccount);
        return ResponseEntity.noContent().build();
    }

    private FundingSourceType resolveFundingSourceType(String fundingSourceType) {
        if (fundingSourceType == null || fundingSourceType.isBlank()) {
            return null;
        }

        return FundingSourceType.fromValue(fundingSourceType)
            .orElseThrow(() -> new ValidationException(
                java.util.List.of(new ValidationError("fundingSourceType", "Funding source must be one of CASH_ON_HAND, BANK_ACCOUNT, or E_WALLET."))
            ));
    }
}
