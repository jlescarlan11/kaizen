package com.kaizen.backend.transaction.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(length = 255)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

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

    public Transaction(
        UserAccount userAccount,
        Category category,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        TransactionType type,
        String description,
        LocalDateTime transactionDate
    ) {
        this(userAccount, category, paymentMethod, amount, type, description, transactionDate, null, null);
    }

    public Transaction(
        UserAccount userAccount,
        Category category,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        TransactionType type,
        String description,
        LocalDateTime transactionDate,
        Boolean reconciliationIncrease
    ) {
        this(userAccount, category, paymentMethod, amount, type, description, transactionDate, reconciliationIncrease, null);
    }

    public Transaction(
        UserAccount userAccount,
        Category category,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        TransactionType type,
        String description,
        LocalDateTime transactionDate,
        Boolean reconciliationIncrease,
        String notes
    ) {
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
