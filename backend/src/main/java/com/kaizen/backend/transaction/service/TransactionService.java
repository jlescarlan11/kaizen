package com.kaizen.backend.transaction.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.transaction.dto.AttachmentResponse;
import com.kaizen.backend.transaction.dto.BalanceHistoryResponse;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserAccountRepository userAccountRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ReceiptAttachmentService attachmentService;
    private final ReminderSchedulerService reminderSchedulerService;
    private final com.kaizen.backend.transaction.repository.ReminderScheduleRepository reminderScheduleRepository;

    public TransactionService(
        TransactionRepository transactionRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository,
        PaymentMethodRepository paymentMethodRepository,
        ReceiptAttachmentService attachmentService,
        ReminderSchedulerService reminderSchedulerService,
        com.kaizen.backend.transaction.repository.ReminderScheduleRepository reminderScheduleRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.attachmentService = attachmentService;
        this.reminderSchedulerService = reminderSchedulerService;
        this.reminderScheduleRepository = reminderScheduleRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        if (request.clientGeneratedId() != null) {
            java.util.Optional<Transaction> existing = transactionRepository.findByClientGeneratedId(request.clientGeneratedId());
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        }

        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Canonical Validation Rules
        if (request.amount() == null) {
            throw new IllegalArgumentException("Amount is required.");
        }
        if (request.amount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be a positive value greater than zero.");
        }
        // Check for max 2 decimal places
        String amountStr = request.amount().toPlainString();
        int decimalPointIndex = amountStr.indexOf('.');
        if (decimalPointIndex >= 0 && amountStr.length() - decimalPointIndex - 1 > 2) {
             throw new IllegalArgumentException("Amount cannot have more than two decimal places.");
        }

        if (request.type() == null) {
            throw new IllegalArgumentException("Transaction type is required.");
        }

        LocalDateTime date = request.transactionDate() != null ? request.transactionDate() : LocalDateTime.now();
        if (date.isAfter(LocalDateTime.now().plusMinutes(1))) { // small buffer for clock skew
            throw new IllegalArgumentException("Transactions cannot be set in the future.");
        }

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(Objects.requireNonNull(request.categoryId()))
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.categoryId()));
        }

        PaymentMethod paymentMethod = null;
        if (request.paymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(Objects.requireNonNull(request.paymentMethodId()))
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + request.paymentMethodId()));
        }

        String notes = (request.notes() == null || request.notes().isBlank()) ? null : request.notes();

        boolean isRecurring = request.isRecurring() != null && request.isRecurring();
        if (isRecurring) {
            if (request.frequencyUnit() == null) {
                throw new IllegalArgumentException("Frequency unit is required for recurring transactions.");
            }
            if (request.frequencyMultiplier() == null || request.frequencyMultiplier() <= 0) {
                throw new IllegalArgumentException("Valid frequency multiplier is required for recurring transactions.");
            }
        }

        Transaction transaction = new Transaction(
            account,
            category,
            paymentMethod,
            request.amount(),
            request.type(),
            request.description(),
            date,
            null,
            notes
        );
        transaction.setIsRecurring(isRecurring);
        if (isRecurring) {
            transaction.setFrequencyUnit(request.frequencyUnit());
            transaction.setFrequencyMultiplier(request.frequencyMultiplier());
        }

        if (request.clientGeneratedId() != null) {
            transaction.setClientGeneratedId(request.clientGeneratedId());
        }

        if (request.parentRecurringTransactionId() != null) {
            Transaction parent = transactionRepository.findById(Objects.requireNonNull(request.parentRecurringTransactionId()))
                .orElseThrow(() -> new IllegalArgumentException("Parent recurring transaction not found with id: " + request.parentRecurringTransactionId()));
            transaction.setParentRecurringTransaction(parent);
        }

        Transaction saved = transactionRepository.save(transaction);

        // Instruction 4: Reminder Scheduler Triggers
        if (isRecurring) {
            reminderSchedulerService.scheduleInitialReminder(saved);
            if (request.remindersEnabled() != null) {
                reminderSchedulerService.toggleReminder(saved.getId(), request.remindersEnabled());
            }
        } else if (saved.getParentRecurringTransaction() != null) {
            reminderSchedulerService.updateReminderOnInstanceLogged(saved);
        }

        // Instruction 2: Balance Auto-Calculation Trigger
        recalculateUserBalance(Objects.requireNonNull(account));

        // Side effect: Mark first transaction added
        if (!account.isFirstTransactionAdded()) {
            account.setFirstTransactionAdded(true);
        }

        userAccountRepository.save(account);

        // Instruction 7: Quick Add Preference Storage
        // Store basic transaction details for pre-filling the next entry.
        String prefs = String.format(
            "{\"amount\":%.2f,\"type\":\"%s\"%s%s}",
            saved.getAmount(),
            saved.getType().name(),
            saved.getCategory() != null ? ",\"categoryId\":" + saved.getCategory().getId() : "",
            saved.getPaymentMethod() != null ? ",\"paymentMethodId\":" + saved.getPaymentMethod().getId() : ""
        );
        account.setQuickAddPreferences(prefs);
        userAccountRepository.save(account);

        return mapToResponse(saved);
    }

    public List<TransactionResponse> getTransactions(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Instruction 6: Descending date/time sort order by default
        return transactionRepository.findByUserAccountIdOrderByTransactionDateDesc(account.getId()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsPaginated(
        String email,
        LocalDateTime lastDate,
        Long lastId,
        int pageSize
    ) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, pageSize);
        return transactionRepository.findByUserAccountIdPaginated(account.getId(), lastDate, lastId, pageable).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public TransactionResponse getTransaction(String email, Long id) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        validateTransactionOwnership(account, transaction);

        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(String email, Long id, TransactionRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        validateTransactionOwnership(account, transaction);

        // Canonical Validation Rules
        if (request.amount() == null) {
            throw new IllegalArgumentException("Amount is required.");
        }
        if (request.amount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be a positive value greater than zero.");
        }
        String amountStr = String.valueOf(request.amount());
        int decimalPointIndex = amountStr.indexOf('.');
        if (decimalPointIndex >= 0 && amountStr.length() - decimalPointIndex - 1 > 2) {
             throw new IllegalArgumentException("Amount cannot have more than two decimal places.");
        }

        if (request.type() == null) {
            throw new IllegalArgumentException("Transaction type is required.");
        }

        if (request.transactionDate() != null && request.transactionDate().isAfter(LocalDateTime.now().plusMinutes(1))) {
            throw new IllegalArgumentException("Transactions cannot be set in the future.");
        }

        // Update fields
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(Objects.requireNonNull(request.categoryId()))
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.categoryId()));
        }

        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setCategory(category);
        transaction.setNotes((request.notes() == null || request.notes().isBlank()) ? null : request.notes());

        PaymentMethod paymentMethod = null;
        if (request.paymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(Objects.requireNonNull(request.paymentMethodId()))
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + request.paymentMethodId()));
        }
        transaction.setPaymentMethod(paymentMethod);

        if (request.transactionDate() != null) {
            transaction.setTransactionDate(request.transactionDate());
        }

        boolean isRecurring = request.isRecurring() != null && request.isRecurring();
        if (isRecurring) {
            if (request.frequencyUnit() == null) {
                throw new IllegalArgumentException("Frequency unit is required for recurring transactions.");
            }
            if (request.frequencyMultiplier() == null || request.frequencyMultiplier() <= 0) {
                throw new IllegalArgumentException("Valid frequency multiplier is required for recurring transactions.");
            }
            transaction.setIsRecurring(true);
            transaction.setFrequencyUnit(request.frequencyUnit());
            transaction.setFrequencyMultiplier(request.frequencyMultiplier());
        } else {
            transaction.setIsRecurring(false);
            transaction.setFrequencyUnit(null);
            transaction.setFrequencyMultiplier(null);
        }

        Transaction saved = transactionRepository.save(transaction);

        // Instruction 4: Reminder Scheduler Trigger
        reminderSchedulerService.rescheduleOnFrequencyChange(saved);
        if (saved.getIsRecurring() && request.remindersEnabled() != null) {
            reminderSchedulerService.toggleReminder(saved.getId(), request.remindersEnabled());
        }

        // Instruction 2: Balance Auto-Calculation Trigger
        recalculateUserBalance(Objects.requireNonNull(account));

        userAccountRepository.save(account);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(String email, Long id) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        validateTransactionOwnership(account, transaction);

        // Cascade storage deletion
        attachmentService.deleteAttachmentsForTransaction(id);

        // Instruction 7: Reminder Cancellation
        reminderSchedulerService.rescheduleOnFrequencyChange(transaction);

        transactionRepository.delete(transaction);

        // Instruction 2: Balance Auto-Calculation Trigger
        recalculateUserBalance(Objects.requireNonNull(account));

        userAccountRepository.save(account);
    }

    @Transactional
    public void bulkDeleteTransactions(String email, List<Long> ids) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        List<Transaction> transactions = transactionRepository.findAllById(Objects.requireNonNull(ids));

        for (Transaction transaction : transactions) {
            validateTransactionOwnership(account, transaction);
            // Cascade storage deletion
            attachmentService.deleteAttachmentsForTransaction(transaction.getId());
            // Instruction 7: Reminder Cancellation
            reminderSchedulerService.rescheduleOnFrequencyChange(transaction);
        }

        transactionRepository.deleteAll(transactions);

        // Instruction 2: Balance Auto-Calculation Trigger
        recalculateUserBalance(Objects.requireNonNull(account));

        userAccountRepository.save(account);
    }

    public BalanceHistoryResponse getBalanceHistory(String email) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        List<Transaction> transactions = transactionRepository.findByUserAccountIdOrderByTransactionDateDesc(account.getId());
        
        // Sort chronologically for running balance computation
        List<Transaction> chronological = new ArrayList<>(transactions);
        chronological.sort(Comparator.comparing(Transaction::getTransactionDate).thenComparing(Transaction::getId));

        List<BalanceHistoryResponse.BalanceHistoryEntry> history = new ArrayList<>();
        java.math.BigDecimal runningBalance = java.math.BigDecimal.ZERO;

        for (Transaction t : chronological) {
            if (t.getType() == TransactionType.INCOME) {
                runningBalance = runningBalance.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                runningBalance = runningBalance.subtract(t.getAmount());
            } else if (t.getType() == TransactionType.RECONCILIATION) {
                if (Boolean.TRUE.equals(t.getReconciliationIncrease())) {
                    runningBalance = runningBalance.add(t.getAmount());
                } else {
                    runningBalance = runningBalance.subtract(t.getAmount());
                }
            }

            history.add(new BalanceHistoryResponse.BalanceHistoryEntry(
                t.getTransactionDate(),
                runningBalance,
                t.getDescription(),
                t.getId(),
                t.getType().name()
            ));
        }

        // Return in reverse chronological order as per Instruction 7
        Collections.reverse(history);
        return new BalanceHistoryResponse(history);
    }

    @Transactional
    public TransactionResponse reconcileBalance(String email, java.math.BigDecimal realWorldBalance, String description) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        java.math.BigDecimal currentBalance = account.getBalance();
        java.math.BigDecimal difference = realWorldBalance.subtract(currentBalance);

        if (difference.compareTo(java.math.BigDecimal.ZERO) == 0) {
            return null; // Or throw an exception if preferred, but PRD says "no adjustment created when balances match"
        }

        Boolean increase = difference.compareTo(java.math.BigDecimal.ZERO) > 0;
        java.math.BigDecimal absoluteDifference = difference.abs();

        Transaction reconciliation = new Transaction(
            account,
            null, // No category
            null, // No specific payment method (could be improved if we have per-method balance)
            absoluteDifference,
            TransactionType.RECONCILIATION,
            description != null ? description : "Balance Reconciliation Adjustment",
            LocalDateTime.now(),
            increase
        );

        Transaction saved = transactionRepository.save(reconciliation);
        
        recalculateUserBalance(Objects.requireNonNull(account));
        userAccountRepository.save(account);

        return mapToResponse(saved);
    }

    @Transactional
    public void recalculateUserBalance(@org.springframework.lang.NonNull UserAccount account) {
        java.math.BigDecimal netAmount = transactionRepository.calculateNetTransactionAmount(Objects.requireNonNull(account.getId()))
            .orElse(java.math.BigDecimal.ZERO);
        
        // Instruction 1 & 8: Include opening balance if confirmed. 
        // For now, we assume account.getBalance() might contain an opening balance seed 
        // if it was set during onboarding but we don't have a separate field yet.
        // However, Section 6a says derived EXCLUSIVELY from transaction store.
        // So we just use netAmount for now.
        account.setBalance(netAmount);
    }

    private void validateTransactionOwnership(UserAccount account, Transaction transaction) {
        if (!transaction.getUserAccount().getId().equals(Objects.requireNonNull(account.getId()))) {
            throw new IllegalArgumentException("You do not have permission to access this transaction.");
        }
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        CategoryResponse categoryResponse = null;
        if (transaction.getCategory() != null) {
            Category cat = transaction.getCategory();
            categoryResponse = new CategoryResponse(
                cat.getId(),
                cat.getName(),
                cat.isGlobal(),
                cat.getIcon(),
                cat.getColor()
            );
        }

        PaymentMethodResponse paymentMethodResponse = null;
        if (transaction.getPaymentMethod() != null) {
            PaymentMethod pm = transaction.getPaymentMethod();
            paymentMethodResponse = new PaymentMethodResponse(
                pm.getId(),
                pm.getName(),
                pm.isGlobal()
            );
        }

        Boolean remindersEnabled = null;
        if (Boolean.TRUE.equals(transaction.getIsRecurring())) {
            remindersEnabled = reminderScheduleRepository.findByTransactionId(transaction.getId())
                .map(com.kaizen.backend.transaction.entity.ReminderSchedule::getIsEnabled)
                .orElse(true);
        }

        return new TransactionResponse(
            transaction.getId(),
            transaction.getAmount(),
            transaction.getType(),
            transaction.getTransactionDate(),
            transaction.getDescription(),
            categoryResponse,
            paymentMethodResponse,
            transaction.getReconciliationIncrease(),
            transaction.getNotes(),
            transaction.getIsRecurring(),
            transaction.getFrequencyUnit(),
            transaction.getFrequencyMultiplier(),
            remindersEnabled,
            attachmentService.getAttachmentsForTransaction(transaction.getId()).stream()
                .map(a -> new AttachmentResponse(
                    a.getId(),
                    a.getFilename(),
                    a.getFileSize(),
                    a.getMimeType(),
                    a.getStorageReference()
                ))
                .collect(Collectors.toList()),
            transaction.getClientGeneratedId()
        );
    }
}
