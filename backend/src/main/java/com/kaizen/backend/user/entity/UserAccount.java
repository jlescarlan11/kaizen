package com.kaizen.backend.user.entity;

import java.util.HashSet;
import java.util.Set;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_account", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_account_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_user_account_provider_identity", columnNames = { "provider_name",
                "provider_user_id" })
})
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

    @Column(name = "picture_url", columnDefinition = "TEXT")
    private String pictureUrl;

    @Column(name = "encrypted_access_token", nullable = false, columnDefinition = "TEXT")
    private String encryptedAccessToken;

    @Column(name = "encrypted_refresh_token", columnDefinition = "TEXT")
    private String encryptedRefreshToken;

    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    @Column(name = "budget_setup_skipped", nullable = false)
    private boolean budgetSetupSkipped = false;

    @Column(name = "tour_completed", nullable = false)
    private boolean tourCompleted = false;

    @Column(name = "first_transaction_added", nullable = false)
    private boolean firstTransactionAdded = false;

    @Column(name = "balance", precision = 15, scale = 2)
    private java.math.BigDecimal balance = java.math.BigDecimal.ZERO;

    @Column(name = "quick_add_preferences", columnDefinition = "TEXT")
    private String quickAddPreferences;

    @Column(name = "reminders_enabled", nullable = false)
    private Boolean remindersEnabled = true;

    @ManyToMany(fetch = FetchType.EAGER)

    @JoinTable(name = "user_role", joinColumns = @JoinColumn(name = "user_account_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public UserAccount(
            String name,
            String email,
            String providerName,
            String providerUserId,
            String passwordHash,
            String pictureUrl,
            String encryptedAccessToken,
            String encryptedRefreshToken) {
        this.name = name;
        this.email = email;
        this.providerName = providerName;
        this.providerUserId = providerUserId;
        this.passwordHash = passwordHash;
        this.pictureUrl = pictureUrl;
        this.encryptedAccessToken = encryptedAccessToken;
        this.encryptedRefreshToken = encryptedRefreshToken;
    }

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public void removeRole(Role role) {
        this.roles.remove(role);
    }
}
