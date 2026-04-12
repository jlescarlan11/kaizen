package com.kaizen.backend.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.payment.dto.PaymentMethodCreatePayload;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import com.kaizen.backend.payment.dto.PaymentMethodSummaryResponse;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
@Transactional(readOnly = true)
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserAccountRepository userAccountRepository;
    private final TransactionRepository transactionRepository;

    public PaymentMethodService(
            PaymentMethodRepository paymentMethodRepository,
            UserAccountRepository userAccountRepository,
            TransactionRepository transactionRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userAccountRepository = userAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<PaymentMethodResponse> getPaymentMethods(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        return paymentMethodRepository.findByUserAccountIdOrGlobalTrue(account.getId()).stream()
                .map(pm -> new PaymentMethodResponse(pm.getId(), pm.getName(), pm.isGlobal(), pm.getDescription()))
                .collect(Collectors.toList());
    }

    public List<PaymentMethodSummaryResponse> getPaymentMethodSummary(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        List<PaymentMethod> allMethods = paymentMethodRepository.findByUserAccountIdOrGlobalTrue(account.getId());
        List<PaymentMethodSummaryResponse> summaries = new ArrayList<>();

        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7).withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (PaymentMethod pm : allMethods) {
            BigDecimal currentBalance = transactionRepository.calculateNetTransactionAmountByPaymentMethod(account.getId(), pm.getId())
                    .orElse(BigDecimal.ZERO);
            
            // Get daily changes for the last 7 days
            List<Object[]> rawChanges = transactionRepository.getDailyBalanceChangesByPaymentMethod(account.getId(), pm.getId(), sevenDaysAgo);
            
            Map<LocalDate, BigDecimal> changesMap = rawChanges.stream()
                    .collect(Collectors.toMap(
                            r -> ((java.sql.Date) r[0]).toLocalDate(),
                            r -> (BigDecimal) r[1]
                    ));

            // Calculate daily balances by working backwards from current balance
            List<BigDecimal> trend = new ArrayList<>();
            BigDecimal runningBalance = currentBalance;
            LocalDate today = LocalDate.now();

            for (int i = 0; i < 7; i++) {
                trend.add(0, runningBalance);
                LocalDate date = today.minusDays(i);
                BigDecimal change = changesMap.getOrDefault(date, BigDecimal.ZERO);
                runningBalance = runningBalance.subtract(change);
            }
            
            summaries.add(new PaymentMethodSummaryResponse(
                    new PaymentMethodResponse(pm.getId(), pm.getName(), pm.isGlobal(), pm.getDescription()),
                    currentBalance,
                    trend));
        }

        return summaries;
    }

    @Transactional
    public PaymentMethodResponse createPaymentMethod(String email, PaymentMethodCreatePayload payload) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (payload.name() == null || payload.name().trim().isEmpty()) {
            throw new IllegalArgumentException("Payment method name cannot be empty.");
        }

        String name = payload.name().trim();

        // Check uniqueness (global)
        if (paymentMethodRepository.findByNameIgnoreCaseAndGlobalTrue(name).isPresent()) {
            throw new IllegalArgumentException("A system payment method with this name already exists.");
        }

        // Check uniqueness (user)
        if (paymentMethodRepository.findByNameIgnoreCaseAndUserAccountId(name, account.getId()).isPresent()) {
            throw new IllegalArgumentException("You already have a payment method with this name.");
        }

        PaymentMethod pm = new PaymentMethod(name, false, account);
        PaymentMethod saved = paymentMethodRepository.save(pm);

        return new PaymentMethodResponse(saved.getId(), saved.getName(), saved.isGlobal(), saved.getDescription());
    }

    public long countTransactionsUsingMethod(String email, Long id) {
        Objects.requireNonNull(id, "Payment method id must not be null");

        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        PaymentMethod pm = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + id));

        if (!pm.isGlobal() && !pm.getUserAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("You do not have permission to access this payment method.");
        }

        return transactionRepository.countByPaymentMethodId(id);
    }

    @Transactional
    public void deletePaymentMethod(String email, Long id) {
        Objects.requireNonNull(id, "Payment method id must not be null");

        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        PaymentMethod pm = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + id));

        if (pm.isGlobal()) {
            throw new IllegalArgumentException("System payment methods cannot be deleted.");
        }

        if (!pm.getUserAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("You do not have permission to delete this payment method.");
        }

        // Orphan resolution: set to null
        transactionRepository.setPaymentMethodToNull(id);

        paymentMethodRepository.delete(pm);
    }
}