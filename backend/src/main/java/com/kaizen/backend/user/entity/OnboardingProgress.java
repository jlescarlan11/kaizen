package com.kaizen.backend.user.entity;

import java.math.BigDecimal;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "onboarding_progress")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OnboardingProgress extends BaseEntity {

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false, unique = true)
    private UserAccount userAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_step", nullable = false, length = 32)
    private OnboardingStep currentStep;

    @Column(name = "balance_value", precision = 15, scale = 2)
    private BigDecimal startingFunds;

    @Enumerated(EnumType.STRING)
    @Column(name = "funding_source_type", length = 32)
    private FundingSourceType fundingSourceType;

    @Column(name = "budget_choice", length = 255)
    private String budgetChoice;

    public OnboardingProgress(UserAccount userAccount) {
        this.userAccount = userAccount;
        this.currentStep = OnboardingStep.BALANCE;
    }
}
