package com.kaizen.backend.auth.controller;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Objects;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.kaizen.backend.auth.config.AuthFlowProperties;
import com.kaizen.backend.auth.dto.GoogleOAuthRedirectResponse;
import com.kaizen.backend.auth.service.CustomUserDetailsService;
import com.kaizen.backend.auth.service.GoogleOAuthService;
import com.kaizen.backend.common.exception.ApiException;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Tag(name = "Auth", description = "Authentication entry points and OAuth callbacks.")
@RestController
@RequestMapping("/api/auth/google")
public class GoogleOAuthController {

    private static final String STATE_SESSION_ATTRIBUTE = "oauth2_state";
    private final SecureRandom secureRandom = new SecureRandom();

    private final AuthFlowProperties authFlowProperties;
    private final GoogleOAuthService googleOAuthService;
    private final CustomUserDetailsService userDetailsService;

    public GoogleOAuthController(
        AuthFlowProperties authFlowProperties,
        GoogleOAuthService googleOAuthService,
        CustomUserDetailsService userDetailsService
    ) {
        this.authFlowProperties = authFlowProperties;
        this.googleOAuthService = googleOAuthService;
        this.userDetailsService = userDetailsService;
    }

    @Operation(
        summary = "Start Google sign-up",
        description = "Builds the Google OAuth 2.0 authorization URL and redirects the client to Google's consent screen.",
        operationId = "startGoogleSignup"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "302",
            description = "Redirects to the Google OAuth 2.0 authorization endpoint."
        ),
        @ApiResponse(
            responseCode = "500",
            description = "OAuth configuration is incomplete.",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(
                    name = "serverError",
                    value = "{\"code\":\"GOOGLE_OAUTH_CONFIGURATION_INVALID\",\"message\":\"Google OAuth configuration is incomplete.\",\"details\":{},\"traceId\":\"0af7651916cd43dd8448eb211c80319c\"}"
                )
            )
        )
    })
    @GetMapping("/authorize")
    public ResponseEntity<GoogleOAuthRedirectResponse> authorize(HttpSession session) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        session.setAttribute(STATE_SESSION_ATTRIBUTE, state);

        URI redirectUri = Objects.requireNonNull(
            googleOAuthService.buildAuthorizationRedirectUri(Objects.requireNonNull(state, "state must not be null")),
            "Authorization redirect URI must not be null"
        );

        return ResponseEntity
            .status(HttpStatus.FOUND)
            .header(HttpHeaders.LOCATION, redirectUri.toString())
            .body(new GoogleOAuthRedirectResponse(redirectUri.toString()));
    }

    @Operation(
        summary = "Handle Google sign-up callback",
        description = "Exchanges the Google authorization code for tokens, fetches user identity data, creates a social account, and redirects to the configured post-signup destination.",
        operationId = "handleGoogleSignupCallback"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "302",
            description = "Redirects to the configured post-signup destination after account creation."
        ),
        @ApiResponse(
            responseCode = "400",
            description = "The callback request is missing the required authorization code.",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(
                    name = "badRequest",
                    value = "{\"code\":\"INVALID_REQUEST\",\"message\":\"Required request parameter 'code' is not present.\",\"details\":{},\"traceId\":\"0af7651916cd43dd8448eb211c80319c\"}"
                )
            )
        )
    })
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
        @RequestParam(value = "code", required = false) String code,
        @RequestParam(value = "state", required = false) String state,
        @RequestParam(value = "error", required = false) String error,
        HttpSession session
    ) {
        try {
            String storedState = (String) session.getAttribute(STATE_SESSION_ATTRIBUTE);
            session.removeAttribute(STATE_SESSION_ATTRIBUTE);

            if (state == null || !state.equals(storedState)) {
                log.warn("Google OAuth callback: state mismatch or state missing.");
                return redirectToSignupWithError("PROVIDER_UNAVAILABLE");
            }

            // Instruction 6 owns explicit cancellation/provider-error behavior for `state` and `error`.
            if (error != null) {
                if ("access_denied".equals(error)) {
                    log.info("Google OAuth sign-up cancelled by user.");

                    String signupUri = Objects.requireNonNull(
                        authFlowProperties.signupScreenUri(),
                        "Signup screen URI must not be null"
                    );

                    return ResponseEntity
                        .status(HttpStatus.FOUND)
                        .location(URI.create(signupUri))
                        .build();
                }
                log.warn("Google OAuth provider returned an error: {}", error);
                return redirectToSignupWithError("PROVIDER_UNAVAILABLE");
            }

            if (code == null || code.isBlank()) {
                log.warn("Google OAuth callback missing required 'code' parameter.");
                return redirectToSignupWithError("PROVIDER_UNAVAILABLE");
            }

            String email = googleOAuthService.handleGoogleCallback(code);

            // After successful callback (user created/updated), log them in
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Persist the security context in the session
            session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext()
            );

            String postSignupUri = authFlowProperties.postSignupRedirectUri();
            URI redirectUri = URI.create(Objects.requireNonNull(postSignupUri, "Post-signup redirect URI must not be null"));

            return ResponseEntity
                .status(HttpStatus.FOUND)
                .location(Objects.requireNonNull(redirectUri))
                .build();
        } catch (ApiException e) {
            log.warn("Google OAuth sign-up: API error: {} (Code: {})", e.getMessage(), e.getCode());
            return redirectToSignupWithError(e.getCode());
        } catch (RestClientException | IllegalStateException e) {
            log.error("Google OAuth provider error or token exchange/userinfo fetch failure.", e);
            return redirectToSignupWithError("PROVIDER_UNAVAILABLE");
        } catch (Exception e) {
            log.error("Unexpected error during Google OAuth callback processing.", e);
            return redirectToSignupWithError("PROVIDER_UNAVAILABLE");
        }
    }


    private ResponseEntity<Void> redirectToSignupWithError(String errorCode) {
        String signupUri = Objects.requireNonNull(
            authFlowProperties.signupScreenUri(),
            "Signup screen URI must not be null"
        );

        return ResponseEntity
            .status(HttpStatus.FOUND)
            .location(Objects.requireNonNull(
                UriComponentsBuilder
                    .fromUriString(signupUri)
                    .queryParam("error", errorCode)
                    .build()
                    .toUri(),
                "Error redirect URI must not be null"
            ))
            .build();
    }
}


