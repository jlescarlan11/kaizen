package com.kaizen.backend.transaction.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.springframework.lang.NonNull;

import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.common.entity.BaseEntity;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.user.entity.UserAccount;

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
@Table(name = "transaction")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Transaction extends BaseEntity {

    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(length = 255)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private OffsetDateTime transactionDate;

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency_unit", length = 20)
    private FrequencyUnit frequencyUnit;

    @Column(name = "frequency_multiplier")
    private Integer frequencyMultiplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_recurring_transaction_id")
    private Transaction parentRecurringTransaction;

    @Column(name = "reconciliation_increase")
    private Boolean reconciliationIncrease;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "client_generated_id", unique = true)
    private String clientGeneratedId;

    public Transaction(
            @NonNull UserAccount userAccount,
            Category category,
            PaymentMethod paymentMethod,
            BigDecimal amount,
            TransactionType type,
            String description,
            OffsetDateTime transactionDate) {
        this(userAccount, category, paymentMethod, amount, type, description, transactionDate, null, null);
    }

    public Transaction(
            @NonNull UserAccount userAccount,
            Category category,
            PaymentMethod paymentMethod,
            BigDecimal amount,
            TransactionType type,
            String description,
            OffsetDateTime transactionDate,
            Boolean reconciliationIncrease) {
        this(userAccount, category, paymentMethod, amount, type, description, transactionDate, reconciliationIncrease,
                null);
    }

    public Transaction(
            @NonNull UserAccount userAccount,
            Category category,
            PaymentMethod paymentMethod,
            BigDecimal amount,
            TransactionType type,
            String description,
            OffsetDateTime transactionDate,
            Boolean reconciliationIncrease,
            String notes) {
        this.userAccount = userAccount;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.transactionDate = transactionDate;
        this.reconciliationIncrease = reconciliationIncrease;
        this.notes = notes;
    }
}