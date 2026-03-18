package com.kaizen.backend.auth.entity;

import java.time.Instant;

import com.kaizen.backend.common.entity.BaseEntity;
import com.kaizen.backend.user.entity.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "persistent_session")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PersistentSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public PersistentSession(UserAccount userAccount, String tokenHash, Instant expiresAt) {
        this.userAccount = userAccount;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }
}
