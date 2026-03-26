package com.kaizen.backend.transaction.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.common.service.NotificationService;
import com.kaizen.backend.transaction.entity.ReminderSchedule;
import com.kaizen.backend.transaction.repository.ReminderScheduleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderDeliveryJob {

    private final ReminderScheduleRepository reminderScheduleRepository;
    private final NotificationService notificationService;

    /**
     * Runs every hour to check for due reminders.
     * Fixed rate: 3600000 ms = 1 hour.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void processReminders() {
        log.info("Starting reminder delivery job...");
        
        LocalDateTime now = LocalDateTime.now();
        // Retry threshold: don't retry more than once every 24 hours
        LocalDateTime retryThreshold = now.minusHours(24);

        List<ReminderSchedule> dueReminders = reminderScheduleRepository.findDueReminders(now, retryThreshold);
        log.info("Found {} reminders to process", dueReminders.size());

        for (ReminderSchedule schedule : dueReminders) {
            try {
                notificationService.sendReminderNotification(
                    schedule.getTransaction().getUserAccount().getEmail(),
                    schedule.getTransaction().getId(),
                    schedule.getTransaction().getDescription(),
                    schedule.getTransaction().getAmount()
                );

                schedule.setRetryCount(schedule.getRetryCount() + 1);
                schedule.setLastRetryTimestamp(now);
                reminderScheduleRepository.save(schedule);
                
                log.info("Delivered reminder for transaction {} (retry count: {})", 
                    schedule.getTransaction().getId(), schedule.getRetryCount());
            } catch (Exception e) {
                log.error("Failed to deliver reminder for transaction {}", schedule.getTransaction().getId(), e);
            }
        }
    }
}
