package com.kaizen.backend.payment.entity;

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
@Table(name = "payment_method")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentMethod extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "is_global", nullable = false)
    private boolean global = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id")
    private UserAccount userAccount;

    public PaymentMethod(String name, boolean isGlobal, UserAccount userAccount) {
        this.name = name;
        this.global = isGlobal;
        this.userAccount = userAccount;
    }
}
