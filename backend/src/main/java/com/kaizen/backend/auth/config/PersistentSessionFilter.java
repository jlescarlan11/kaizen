package com.kaizen.backend.auth.config;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.dao.DataAccessException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.service.CustomUserDetailsService;
import com.kaizen.backend.auth.util.SessionTokenUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Authentication Enforcement Middleware.
 * Validates persistent session credentials and populates the SecurityContext.
 * Rejects invalid or expired credentials early with a 401 signal.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PersistentSessionFilter extends OncePerRequestFilter {

    private final PersistentSessionRepository persistentSessionRepository;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint authenticationEntryPoint;
    private final SessionProperties sessionProperties;
    
    // Consistent failure signal attributes for Instruction 5 audit logger
    public static final String AUTH_FAILURE_SIGNAL_ATTR = "KZN_AUTH_FAILURE_SIGNAL";
    public static final String AUTH_FAILURE_REASON_ATTR = "KZN_AUTH_FAILURE_REASON";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                   @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Skip if already authenticated (e.g. by another filter in the chain)
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<String> tokenOpt = getPersistentToken(request);

        if (tokenOpt.isPresent()) {
            String token = tokenOpt.get();
            
            // Check structural integrity (malformed check)
            if (token.length() < 10) { // Arbitrary check for demonstration
                handleAuthenticationFailure(request, response, new BadCredentialsException("Malformed session token"), "MALFORMED_TOKEN");
                return;
            }

            try {
                String tokenHash = SessionTokenUtil.hashToken(token);
                Optional<PersistentSession> sessionOpt = persistentSessionRepository.findByTokenHash(tokenHash);

                if (sessionOpt.isPresent()) {
                    PersistentSession session = sessionOpt.get();

                    if (session.getExpiresAt().isAfter(Instant.now())) {
                        restoreSecurityContext(session, request);
                    } else {
                        handleAuthenticationFailure(request, response, new CredentialsExpiredException("Persistent session expired"), "EXPIRED_SESSION");
                        return;
                    }
                } else {
                    handleAuthenticationFailure(request, response, new BadCredentialsException("Invalid session token"), "INVALID_TOKEN");
                    return;
                }
            } catch (AuthenticationException | IllegalStateException | DataAccessException e) {
                log.error("Error during authentication validation", e);
                handleAuthenticationFailure(request, response, new BadCredentialsException("Authentication system error"), "SYSTEM_ERROR");
                return;
            }
        }

        // If no credentials are provided, we continue.
        // Spring Security's AuthorizationFilter will block access to protected endpoints.
        filterChain.doFilter(request, response);
    }

    private Optional<String> getPersistentToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> sessionProperties.cookieName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void restoreSecurityContext(PersistentSession session, HttpServletRequest request) {
        String email = session.getUserAccount().getEmail();
        log.debug("Restoring security context from persistent session for user: {}", email);

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Ensure the Spring Session picks up the new authentication
        request.getSession(true).setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        
        request.setAttribute("KZN_AUTH_STATUS", "SUCCESS");
    }

    private void handleAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, 
                                           AuthenticationException ex, String reason) throws IOException, ServletException {
        log.debug("Authentication failure [{}]: {}", reason, ex.getMessage());
        
        // Expose consistent failure signal for Instruction 5 logger
        request.setAttribute(AUTH_FAILURE_SIGNAL_ATTR, true);
        request.setAttribute(AUTH_FAILURE_REASON_ATTR, reason);
        
        // Use the configured entry point to return 401 with no payload
        authenticationEntryPoint.commence(request, response, ex);
    }
}
