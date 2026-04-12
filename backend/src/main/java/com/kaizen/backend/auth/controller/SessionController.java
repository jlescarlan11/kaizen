package com.kaizen.backend.auth.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.auth.dto.SessionDTO;
import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.util.SessionTokenUtil;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Tag(name = "Sessions", description = "Persistent session management.")
@RestController
@RequestMapping("/api/auth/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final PersistentSessionRepository persistentSessionRepository;
    private final UserAccountRepository userAccountRepository;
    private static final String SESSION_COOKIE_NAME = "kzn_pst";

    @Operation(summary = "List active persistent sessions", description = "Returns a list of all persistent sessions for the current user.")
    @GetMapping
    public ResponseEntity<List<SessionDTO>> listSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        UserAccount user = userAccountRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User account not found"));

        String currentTokenHash = getCurrentSessionTokenHash(request).orElse(null);

        List<SessionDTO> sessions = persistentSessionRepository.findAllByUserAccount(user).stream()
                .map(s -> new SessionDTO(
                        s.getId(),
                        s.getCreatedAt(),
                        s.getExpiresAt(),
                        s.getTokenHash().equals(currentTokenHash)))
                .toList();

        return ResponseEntity.ok(sessions);
    }

    @Operation(summary = "Revoke a persistent session", description = "Invalidates and removes a specific persistent session record.")
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> revokeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable long id) {

        UserAccount user = userAccountRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User account not found"));

        Optional<PersistentSession> sessionOpt = persistentSessionRepository.findById(id);

        if (sessionOpt.isPresent()) {
            PersistentSession session = sessionOpt.get();
            // Security check: ensure the session belongs to the user
            if (session.getUserAccount().getId().equals(user.getId())) {
                persistentSessionRepository.delete(session);
                return ResponseEntity.ok().build();
            }
        }

        return ResponseEntity.notFound().build();
    }

    private Optional<String> getCurrentSessionTokenHash(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> SESSION_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .map(SessionTokenUtil::hashToken)
                .findFirst();
    }
}
