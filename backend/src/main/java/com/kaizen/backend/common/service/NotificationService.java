package com.kaizen.backend.common.service;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {

    /**
     * Sends a reminder notification to the user.
     * In a real implementation, this would use a push notification provider.
     */
    public void sendReminderNotification(String email, Long transactionId, String description, java.math.BigDecimal amount) {
        log.info("SENT NOTIFICATION: To: {}, Subject: Reminder for {}, Message: Don't forget to log your recurring transaction of {} for {}", 
            email, description, amount, description);
        
        // Placeholder for real push delivery:
        // pushProvider.send(email, payload);
    }
}
