package com.kaizen.backend.payment.seed;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
        List<PaymentMethodTemplate> defaultMethods = List.of(
            new PaymentMethodTemplate("Cash", "Physical money that you have on hand (notes and coins).\n\nDistinct Money: Represents liquid, physical funds that you carry and spend directly.\n\nExamples: Paper money (e.g., PHP, USD), Coins, Emergency cash stash"),
            new PaymentMethodTemplate("Bank Account (Debit Card)", "Funds stored in your bank account that you access through debit cards or linked transactions.\n\nDistinct Money: This represents funds held in traditional bank accounts, accessed via debit cards, ATM withdrawals, or bank transfers.\n\nExamples: Checking account (linked to debit card), Savings account (linked to debit card), ATM withdrawals, Bank-to-bank transfers (between accounts)"),
            new PaymentMethodTemplate("Digital Wallet (E-wallet)", "Funds stored in digital wallets or mobile payment platforms, which can be used for online or in-person payments.\n\nDistinct Money: This category represents money stored in online payment systems, separate from bank accounts.\n\nExamples: PayPal, GCash, Apple Pay, Google Pay, Venmo"),
            new PaymentMethodTemplate("Credit Card", "Borrowed money provided by financial institutions for making purchases, which you are required to pay back.\n\nDistinct Money: This represents borrowed money that you must pay back, typically with interest.\n\nExamples: Visa, Mastercard, American Express, Store credit cards")
        );

        Set<String> approvedNames = defaultMethods.stream()
            .map(t -> t.name().toLowerCase())
            .collect(Collectors.toSet());

        // 1. Cleanup old global methods
        List<PaymentMethod> existingGlobals = paymentMethodRepository.findByGlobalTrue();
        for (PaymentMethod pm : existingGlobals) {
            if (!approvedNames.contains(pm.getName().toLowerCase())) {
                log.info("Removing global status from old payment method: {}", pm.getName());
                pm.setGlobal(false);
                paymentMethodRepository.save(pm);
            }
        }

        // 2. Upsert approved methods
        for (PaymentMethodTemplate template : defaultMethods) {
            paymentMethodRepository.findByNameIgnoreCaseAndGlobalTrue(template.name())
                .ifPresentOrElse(
                    pm -> {
                        pm.setDescription(template.description());
                        paymentMethodRepository.save(pm);
                    },
                    () -> {
                        log.info("Seeding default payment method: {}", template.name());
                        PaymentMethod pm = new PaymentMethod(template.name(), true, null);
                        pm.setDescription(template.description());
                        paymentMethodRepository.save(pm);
                    }
                );
        }
    }

    private record PaymentMethodTemplate(String name, String description) {}
}
