package com.kaizen.backend.payment.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
        TransactionRepository transactionRepository
    ) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userAccountRepository = userAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<PaymentMethodResponse> getPaymentMethods(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        return paymentMethodRepository.findByUserAccountIdOrGlobalTrue(account.getId()).stream()
            .map(pm -> new PaymentMethodResponse(pm.getId(), pm.getName(), pm.isGlobal()))
            .collect(Collectors.toList());
    }

    public List<PaymentMethodSummaryResponse> getPaymentMethodSummary(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        List<PaymentMethod> allMethods = paymentMethodRepository.findByUserAccountIdOrGlobalTrue(account.getId());
        Map<Long, PaymentMethod> methodMap = allMethods.stream().collect(Collectors.toMap(PaymentMethod::getId, pm -> pm));

        List<Object[]> groupedResults = transactionRepository.getExpenseSummaryGroupedByPaymentMethod(account.getId());
        List<PaymentMethodSummaryResponse> summaries = new ArrayList<>();

        for (Object[] result : groupedResults) {
            Long methodId = (Long) result[0];
            BigDecimal total = (BigDecimal) result[1];
            PaymentMethod pm = methodMap.get(methodId);
            if (pm != null) {
                summaries.add(new PaymentMethodSummaryResponse(
                    new PaymentMethodResponse(pm.getId(), pm.getName(), pm.isGlobal()),
                    total
                ));
            }
        }

        // Add "Unspecified" if exists
        BigDecimal unspecifiedTotal = transactionRepository.getUnspecifiedExpenseSummary(account.getId());
        if (unspecifiedTotal != null && unspecifiedTotal.compareTo(BigDecimal.ZERO) > 0) {
            summaries.add(new PaymentMethodSummaryResponse(null, unspecifiedTotal));
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

        return new PaymentMethodResponse(saved.getId(), saved.getName(), saved.isGlobal());
    }

    public long countTransactionsUsingMethod(String email, Long id) {
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
