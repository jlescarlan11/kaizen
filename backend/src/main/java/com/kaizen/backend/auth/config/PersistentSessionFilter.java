package com.kaizen.backend.auth.config;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
 * Filter that checks for a persistent session cookie and restores the authentication
 * context if a valid session is found.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PersistentSessionFilter extends OncePerRequestFilter {

    private final PersistentSessionRepository persistentSessionRepository;
    private final CustomUserDetailsService userDetailsService;

    private static final String SESSION_COOKIE_NAME = "kzn_pst";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip if already authenticated
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<String> tokenOpt = getPersistentToken(request);

        if (tokenOpt.isPresent()) {
            String token = tokenOpt.get();
            String tokenHash = SessionTokenUtil.hashToken(token);

            Optional<PersistentSession> sessionOpt = persistentSessionRepository.findByTokenHash(tokenHash);

            if (sessionOpt.isPresent()) {
                PersistentSession session = sessionOpt.get();

                if (session.getExpiresAt().isAfter(Instant.now())) {
                    restoreSecurityContext(session, request);
                } else {
                    log.debug("Persistent session expired for user: {}", session.getUserAccount().getEmail());
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> getPersistentToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> SESSION_COOKIE_NAME.equals(cookie.getName()))
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
    }
}
