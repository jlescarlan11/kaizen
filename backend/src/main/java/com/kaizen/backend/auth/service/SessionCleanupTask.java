package com.kaizen.backend.auth.service;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.auth.repository.PersistentSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Background task to clean up expired persistent sessions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SessionCleanupTask {

    private final PersistentSessionRepository persistentSessionRepository;

    /**
     * Runs every day at midnight (UTC) to remove expired sessions.
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupExpiredSessions() {
        log.info("Starting background cleanup of expired persistent sessions.");
        try {
            persistentSessionRepository.deleteByExpiresAtBefore(Instant.now());
            log.info("Finished background cleanup of expired persistent sessions.");
        } catch (Exception e) {
            log.error("Failed to clean up expired persistent sessions", e);
        }
    }
}
