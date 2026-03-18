package com.kaizen.backend.auth.controller;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Objects;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
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
import com.kaizen.backend.auth.service.PersistentSessionService;
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
    private static final String REDIRECT_URI_SESSION_ATTRIBUTE = "oauth2_redirect_uri";
    private final SecureRandom secureRandom = new SecureRandom();

    private final AuthFlowProperties authFlowProperties;
    private final GoogleOAuthService googleOAuthService;
    private final CustomUserDetailsService userDetailsService;
    private final PersistentSessionService persistentSessionService;

    public GoogleOAuthController(
        AuthFlowProperties authFlowProperties,
        GoogleOAuthService googleOAuthService,
        CustomUserDetailsService userDetailsService,
        PersistentSessionService persistentSessionService
    ) {
        this.authFlowProperties = authFlowProperties;
        this.googleOAuthService = googleOAuthService;
        this.userDetailsService = userDetailsService;
        this.persistentSessionService = persistentSessionService;
    }

    @Operation(
        summary = "Start Google auth",
        description = "Builds the Google OAuth 2.0 authorization URL and redirects the client to Google's consent screen.",
        operationId = "startGoogleAuth"
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
    public ResponseEntity<GoogleOAuthRedirectResponse> authorize(
            @RequestParam(value = "redirect_uri", required = false) String redirectUriParam,
            HttpSession session) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        session.setAttribute(STATE_SESSION_ATTRIBUTE, state);
        
        // Store the dynamic redirect URI from the frontend in the session
        if (redirectUriParam != null && !redirectUriParam.isBlank()) {
            session.setAttribute(REDIRECT_URI_SESSION_ATTRIBUTE, redirectUriParam);
        } else {
            session.removeAttribute(REDIRECT_URI_SESSION_ATTRIBUTE);
        }

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
        summary = "Handle Google auth callback",
        description = "Exchanges the Google authorization code for tokens, fetches user identity data, creates or resolves a social account, and redirects to the configured post-auth destination.",
        operationId = "handleGoogleAuthCallback"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "302",
            description = "Redirects to the configured post-auth destination after account resolution."
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
        // Retrieve dynamic redirect URI from session or use fallback from properties
        String dynamicBaseUri = (String) session.getAttribute(REDIRECT_URI_SESSION_ATTRIBUTE);
        
        try {
            String storedState = (String) session.getAttribute(STATE_SESSION_ATTRIBUTE);
            session.removeAttribute(STATE_SESSION_ATTRIBUTE);

            if (state == null || !state.equals(storedState)) {
                log.warn("Google OAuth callback: state mismatch or state missing.");
                return redirectToAuthWithError("PROVIDER_UNAVAILABLE", dynamicBaseUri);
            }

            if (error != null) {
                if ("access_denied".equals(error)) {
                    log.info("Google OAuth flow cancelled by user.");

                    String authUri = dynamicBaseUri != null 
                        ? UriComponentsBuilder.fromUriString(dynamicBaseUri).path("/signin").build().toString()
                        : authFlowProperties.authScreenUri();

                    return ResponseEntity
                        .status(HttpStatus.FOUND)
                        .location(URI.create(authUri))
                        .build();
                }
                log.warn("Google OAuth provider returned an error: {}", error);
                return redirectToAuthWithError("PROVIDER_UNAVAILABLE", dynamicBaseUri);
            }

            if (code == null || code.isBlank()) {
                log.warn("Google OAuth callback missing required 'code' parameter.");
                return redirectToAuthWithError("PROVIDER_UNAVAILABLE", dynamicBaseUri);
            }

            String email = googleOAuthService.handleGoogleCallback(code);

            // Create persistent session
            String persistentToken = persistentSessionService.createSession(email);

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

            String postAuthUri = dynamicBaseUri != null
                ? UriComponentsBuilder.fromUriString(dynamicBaseUri).build().toString()
                : authFlowProperties.postAuthRedirectUri();
                
            URI redirectUri = URI.create(postAuthUri);

            ResponseCookie cookie = ResponseCookie.from("kzn_pst", persistentToken)
                .httpOnly(true)
                .secure(true) // Assumes production is over HTTPS
                .path("/")
                .maxAge(90 * 24 * 60 * 60) // 90 days in seconds
                .sameSite("Lax")
                .build();

            return ResponseEntity
                .status(HttpStatus.FOUND)
                .location(redirectUri)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
        } catch (ApiException e) {
            log.warn("Google OAuth auth flow: API error: {} (Code: {})", e.getMessage(), e.getCode());
            return redirectToAuthWithError(e.getCode(), dynamicBaseUri);
        } catch (RestClientException | IllegalStateException e) {
            log.error("Google OAuth provider error or token exchange/userinfo fetch failure.", e);
            return redirectToAuthWithError("PROVIDER_UNAVAILABLE", dynamicBaseUri);
        } catch (Exception e) {
            log.error("Unexpected error during Google OAuth callback processing.", e);
            return redirectToAuthWithError("PROVIDER_UNAVAILABLE", dynamicBaseUri);
        } finally {
            // Cleanup the session attribute after processing
            session.removeAttribute(REDIRECT_URI_SESSION_ATTRIBUTE);
        }
    }


    private ResponseEntity<Void> redirectToAuthWithError(String errorCode, String dynamicBaseUri) {
        String authUri = dynamicBaseUri != null
            ? UriComponentsBuilder.fromUriString(dynamicBaseUri).path("/signin").build().toString()
            : authFlowProperties.authScreenUri();

        return ResponseEntity
            .status(HttpStatus.FOUND)
            .location(Objects.requireNonNull(
                UriComponentsBuilder
                    .fromUriString(authUri)
                    .queryParam("error", errorCode)
                    .build()
                    .toUri(),
                "Error redirect URI must not be null"
            ))
            .build();
    }
}
