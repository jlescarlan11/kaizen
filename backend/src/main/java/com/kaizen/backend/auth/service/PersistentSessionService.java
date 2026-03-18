package com.kaizen.backend.auth.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.auth.repository.PersistentSessionRepository;
import com.kaizen.backend.auth.util.SessionTokenUtil;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersistentSessionService {

    private final PersistentSessionRepository persistentSessionRepository;
    private final UserAccountRepository userAccountRepository;

    private static final int SESSION_EXPIRY_DAYS = 90;

    /**
     * Creates a new persistent session for the given user email.
     * 
     * @param email The user's email.
     * @return The raw session token.
     */
    @Transactional
    public String createSession(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("User account not found for email: " + email));

        String rawToken = SessionTokenUtil.generateToken();
        String tokenHash = SessionTokenUtil.hashToken(rawToken);
        Instant expiresAt = Instant.now().plus(SESSION_EXPIRY_DAYS, ChronoUnit.DAYS);

        PersistentSession session = new PersistentSession(userAccount, tokenHash, expiresAt);
        persistentSessionRepository.save(session);

        return rawToken;
    }
}
