package com.kaizen.backend.user.entity;

import java.math.BigDecimal;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_funding_source")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserFundingSource extends BaseEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 32)
    private FundingSourceType sourceType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "current_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    public UserFundingSource(
        UserAccount userAccount,
        FundingSourceType sourceType,
        String name,
        BigDecimal currentBalance,
        boolean primary
    ) {
        this.userAccount = userAccount;
        this.sourceType = sourceType;
        this.name = name;
        this.currentBalance = currentBalance;
        this.primary = primary;
    }
}
