package com.kaizen.backend.auth.repository;

import java.util.List;
import java.util.Optional;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.auth.entity.PersistentSession;
import com.kaizen.backend.user.entity.UserAccount;

@Repository
public interface PersistentSessionRepository extends JpaRepository<PersistentSession, Long> {
    @Query("SELECT ps FROM PersistentSession ps JOIN FETCH ps.userAccount WHERE ps.tokenHash = :tokenHash")
    Optional<PersistentSession> findByTokenHash(String tokenHash);
    List<PersistentSession> findAllByUserAccount(UserAccount userAccount);
    
    @Modifying
    @Transactional
    void deleteByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    void deleteByUserAccount(UserAccount userAccount);

    @Modifying
    @Query("DELETE FROM PersistentSession s WHERE s.expiresAt < :now")
    void deleteByExpiresAtBefore(Instant now);
}
