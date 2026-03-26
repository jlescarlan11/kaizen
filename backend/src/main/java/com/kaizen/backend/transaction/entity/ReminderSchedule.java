package com.kaizen.backend.transaction.entity;

import java.time.LocalDateTime;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reminder_schedule")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReminderSchedule extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private Transaction transaction;

    @Column(name = "next_reminder_timestamp")
    private LocalDateTime nextReminderTimestamp;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    // Retry state fields as per Instruction 3 if confirmed (Open Question 6)
    // Provisionally adding them as they are mentioned in scope.
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "last_retry_timestamp")
    private LocalDateTime lastRetryTimestamp;

    public ReminderSchedule(Transaction transaction, LocalDateTime nextReminderTimestamp) {
        this.transaction = transaction;
        this.nextReminderTimestamp = nextReminderTimestamp;
        this.isEnabled = true;
        this.retryCount = 0;
    }
}
