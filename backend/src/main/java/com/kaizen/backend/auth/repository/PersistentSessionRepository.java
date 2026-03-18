package com.kaizen.backend.auth.repository;

import java.util.List;
import java.util.Optional;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.user.entity.UserAccount;

@Repository
public interface PersistentSessionRepository extends JpaRepository<PersistentSession, Long> {
    Optional<PersistentSession> findByTokenHash(String tokenHash);
    List<PersistentSession> findAllByUserAccount(UserAccount userAccount);
    
    @Modifying
    void deleteByTokenHash(String tokenHash);

    @Modifying
    @Query("DELETE FROM PersistentSession s WHERE s.expiresAt < :now")
    void deleteByExpiresAtBefore(Instant now);
}
