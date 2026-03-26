package com.kaizen.backend.payment.seed;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class PaymentMethodSeed implements CommandLineRunner {

    private final PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodSeed(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedDefaultPaymentMethods();
    }

    private void seedDefaultPaymentMethods() {
        // Provisional list per PRD Open Question 2
        List<String> defaultMethods = List.of("Cash", "Credit Card", "Debit Card", "Bank Transfer");

        for (String methodName : defaultMethods) {
            if (paymentMethodRepository.findByNameIgnoreCaseAndGlobalTrue(methodName).isEmpty()) {
                log.info("Seeding default payment method: {}", methodName);
                paymentMethodRepository.save(new PaymentMethod(methodName, true, null));
            }
        }
    }
}
