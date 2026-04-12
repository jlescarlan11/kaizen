package com.kaizen.backend.transaction.repository;

import java.util.List;
import java.util.Optional;
import java.time.OffsetDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.kaizen.backend.transaction.entity.ReminderSchedule;

@Repository
public interface ReminderScheduleRepository extends JpaRepository<ReminderSchedule, Long> {
    Optional<ReminderSchedule> findByTransactionId(Long transactionId);
    void deleteByTransactionId(Long transactionId);

    @Query("SELECT rs FROM ReminderSchedule rs " +
           "JOIN rs.transaction t " +
           "JOIN t.userAccount u " +
           "WHERE rs.isEnabled = true " +
           "AND u.remindersEnabled = true " +
           "AND rs.nextReminderTimestamp <= :now " +
           "AND (rs.lastRetryTimestamp IS NULL OR rs.lastRetryTimestamp <= :retryThreshold) " +
           "AND rs.retryCount < 3")
    List<ReminderSchedule> findDueReminders(OffsetDateTime now, OffsetDateTime retryThreshold);
}
