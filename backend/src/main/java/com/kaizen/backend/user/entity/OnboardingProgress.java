package com.kaizen.backend.user.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
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

    @Column(name = "initial_transaction_description", length = 255)
    private String initialTransactionDescription;

    @Column(name = "initial_transaction_notes", columnDefinition = "TEXT")
    private String initialTransactionNotes;

    @Column(name = "initial_transaction_payment_method_id")
    private Long initialTransactionPaymentMethodId;

    @Column(name = "initial_transaction_date")
    private java.time.OffsetDateTime initialTransactionDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "onboarding_initial_balance", joinColumns = @JoinColumn(name = "onboarding_progress_id"))
    private List<OnboardingInitialBalance> initialBalances = new ArrayList<>();

    public OnboardingProgress(UserAccount userAccount) {
        this.userAccount = userAccount;
        this.currentStep = OnboardingStep.BALANCE;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OnboardingInitialBalance {
        @Column(name = "payment_method_id")
        private Long paymentMethodId;
        
        @Column(name = "amount", precision = 15, scale = 2)
        private BigDecimal amount;
        
        @Column(name = "description", length = 255)
        private String description;
        
        @Column(name = "notes", columnDefinition = "TEXT")
        private String notes;
        
        @Column(name = "transaction_date")
        private java.time.OffsetDateTime transactionDate;
    }
}
