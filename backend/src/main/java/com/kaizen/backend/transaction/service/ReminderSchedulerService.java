package com.kaizen.backend.transaction.service;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.transaction.entity.FrequencyUnit;
import com.kaizen.backend.transaction.entity.ReminderSchedule;
import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.repository.ReminderScheduleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderSchedulerService {

    @Transactional
    public void toggleReminder(Long transactionId, Boolean enabled) {
        if (enabled == null) return;
        reminderScheduleRepository.findByTransactionId(transactionId).ifPresent(schedule -> {
            schedule.setIsEnabled(enabled);
            reminderScheduleRepository.save(schedule);
        });
    }

    private final ReminderScheduleRepository reminderScheduleRepository;

    /**
     * Computes the next reminder timestamp based on anchor date and frequency.
     */
    public OffsetDateTime calculateNextReminderDate(OffsetDateTime anchorDate, FrequencyUnit unit, Integer multiplier) {
        if (anchorDate == null || unit == null || multiplier == null || multiplier <= 0) {
            return null;
        }

        switch (unit) {
            case DAILY:
                return anchorDate.plusDays(multiplier);
            case WEEKLY:
                return anchorDate.plusWeeks(multiplier);
            case MONTHLY:
                return anchorDate.plusMonths(multiplier);
            case YEARLY:
                return anchorDate.plusYears(multiplier);
            default:
                throw new IllegalArgumentException("Unsupported frequency unit: " + unit);
        }
    }

    /**
     * Trigger 1: Initial save of a recurring transaction.
     */
    @Transactional
    public void scheduleInitialReminder(Transaction transaction) {
        if (!Boolean.TRUE.equals(transaction.getIsRecurring())) {
            return;
        }

        OffsetDateTime nextReminder = calculateNextReminderDate(
            transaction.getTransactionDate(),
            transaction.getFrequencyUnit(),
            transaction.getFrequencyMultiplier()
        );

        ReminderSchedule schedule = new ReminderSchedule(transaction, nextReminder);
        reminderScheduleRepository.save(schedule);
        log.info("Scheduled initial reminder for transaction {} at {}", transaction.getId(), nextReminder);
    }

    /**
     * Trigger 2: Instance logged.
     */
    @Transactional
    public void updateReminderOnInstanceLogged(Transaction instance) {
        Transaction parent = instance.getParentRecurringTransaction();
        if (parent == null) {
            return;
        }

        reminderScheduleRepository.findByTransactionId(parent.getId()).ifPresent(schedule -> {
            OffsetDateTime nextReminder = calculateNextReminderDate(
                instance.getTransactionDate(),
                parent.getFrequencyUnit(),
                parent.getFrequencyMultiplier()
            );
            schedule.setNextReminderTimestamp(nextReminder);
            schedule.setRetryCount(0); // Reset retry count for new instance
            schedule.setLastRetryTimestamp(null);
            reminderScheduleRepository.save(schedule);
            log.info("Updated reminder for recurring transaction {} based on logged instance {} to {}", 
                parent.getId(), instance.getId(), nextReminder);
        });
    }

    /**
     * Trigger 3: Frequency change on edit.
     */
    @Transactional
    public void rescheduleOnFrequencyChange(Transaction transaction) {
        if (!Boolean.TRUE.equals(transaction.getIsRecurring())) {
            reminderScheduleRepository.deleteByTransactionId(transaction.getId());
            return;
        }

        reminderScheduleRepository.findByTransactionId(transaction.getId()).ifPresentOrElse(
            schedule -> {
                OffsetDateTime nextReminder = calculateNextReminderDate(
                    transaction.getTransactionDate(),
                    transaction.getFrequencyUnit(),
                    transaction.getFrequencyMultiplier()
                );
                schedule.setNextReminderTimestamp(nextReminder);
                reminderScheduleRepository.save(schedule);
                log.info("Rescheduled reminder for transaction {} due to frequency change to {}", 
                    transaction.getId(), nextReminder);
            },
            () -> {
                // If it was not recurring before but now it is
                scheduleInitialReminder(transaction);
            }
        );
    }
}
