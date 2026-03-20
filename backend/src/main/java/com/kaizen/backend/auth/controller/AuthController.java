package com.kaizen.backend.auth.controller;

import java.util.Arrays;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.service.GoogleOAuthService;
import com.kaizen.backend.auth.util.SessionTokenUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Tag(name = "Auth", description = "Authentication actions.")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PersistentSessionRepository persistentSessionRepository;
    private final GoogleOAuthService googleOAuthService;
    private static final String SESSION_COOKIE_NAME = "kzn_pst";

    @Operation(summary = "Logout the current user", description = "Invalidates the current session.")
    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        // 1. Revoke third-party tokens if authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            googleOAuthService.revokeTokens(userDetails.getUsername());
        }

        // 2. Invalidate HttpSession
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // 3. Clear SecurityContext from the current thread
        SecurityContextHolder.clearContext();

        // 4. Clear persistent session from database if present
        if (request.getCookies() != null) {
            Arrays.stream(request.getCookies())
                .filter(c -> SESSION_COOKIE_NAME.equals(c.getName()))
                .findFirst()
                .ifPresent(cookie -> {
                    String token = cookie.getValue();
                    if (token != null && !token.isBlank()) {
                        String tokenHash = SessionTokenUtil.hashToken(token);
                        persistentSessionRepository.deleteByTokenHash(tokenHash);
                    }
                });
        }

        // 5. Clear the cookie from the client
        ResponseCookie clearCookie = ResponseCookie.from(SESSION_COOKIE_NAME, "")
            .httpOnly(true)
            .secure(request.isSecure()) // Dynamic based on request protocol
            .path("/")
            .maxAge(0) // Expire immediately
            .sameSite("Lax")
            .build();

        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
            .build();
    }
}
