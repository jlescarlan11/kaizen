package com.kaizen.backend.user.entity;

import com.kaizen.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "user_account",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_account_email", columnNames = "email"),
        @UniqueConstraint(
            name = "uk_user_account_provider_identity",
            columnNames = {"provider_name", "provider_user_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAccount extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "provider_name", nullable = false, length = 50)
    private String providerName;

    @Column(name = "provider_user_id", nullable = false, length = 255)
    private String providerUserId;

    @Column(name = "password_hash")
    private String passwordHash;

    @Lob
    @Column(name = "encrypted_access_token", nullable = false)
    private String encryptedAccessToken;

    @Lob
    @Column(name = "encrypted_refresh_token")
    private String encryptedRefreshToken;

    public UserAccount(
        String name,
        String email,
        String providerName,
        String providerUserId,
        String passwordHash,
        String encryptedAccessToken,
        String encryptedRefreshToken
    ) {
        this.name = name;
        this.email = email;
        this.providerName = providerName;
        this.providerUserId = providerUserId;
        this.passwordHash = passwordHash;
        this.encryptedAccessToken = encryptedAccessToken;
        this.encryptedRefreshToken = encryptedRefreshToken;
    }
}
