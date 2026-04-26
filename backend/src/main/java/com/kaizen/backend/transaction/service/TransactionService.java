package com.kaizen.backend.transaction.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.budget.entity.BudgetPeriod;
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
import com.kaizen.backend.transaction.specification.TransactionSpecification;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

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
    private final com.kaizen.backend.budget.repository.BudgetRepository budgetRepository;
    private final BudgetRecalcService budgetRecalcService;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserAccountRepository userAccountRepository,
            CategoryRepository categoryRepository,
            PaymentMethodRepository paymentMethodRepository,
            ReceiptAttachmentService attachmentService,
            ReminderSchedulerService reminderSchedulerService,
            com.kaizen.backend.transaction.repository.ReminderScheduleRepository reminderScheduleRepository,
            com.kaizen.backend.budget.repository.BudgetRepository budgetRepository,
            BudgetRecalcService budgetRecalcService) {
        this.transactionRepository = transactionRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.attachmentService = attachmentService;
        this.reminderSchedulerService = reminderSchedulerService;
        this.reminderScheduleRepository = reminderScheduleRepository;
        this.budgetRepository = budgetRepository;
        this.budgetRecalcService = budgetRecalcService;
    }

    @Transactional
    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        if (request.clientGeneratedId() != null) {
            java.util.Optional<Transaction> existing = transactionRepository
                    .findByClientGeneratedId(request.clientGeneratedId());
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        }

        UserAccount account = requireAccount(email);
        validateRequest(request);

        OffsetDateTime date = request.transactionDate() != null ? request.transactionDate() : OffsetDateTime.now();

        Category category = fetchCategory(request.categoryId());
        PaymentMethod paymentMethod = fetchPaymentMethod(request.paymentMethodId());

        if (request.type() == TransactionType.EXPENSE) {
            validatePaymentMethodBalance(account, paymentMethod, request.amount(), null);
        }

        String notes = (request.notes() == null || request.notes().isBlank()) ? null : request.notes();
        boolean isRecurring = request.isRecurring() != null && request.isRecurring();

        if (isRecurring) {
            if (request.frequencyUnit() == null) {
                throw new IllegalArgumentException("Frequency unit is required for recurring transactions.");
            }
            if (request.frequencyMultiplier() == null || request.frequencyMultiplier() <= 0) {
                throw new IllegalArgumentException(
                        "Valid frequency multiplier is required for recurring transactions.");
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
                notes);

        transaction.setIsRecurring(isRecurring);
        if (isRecurring) {
            transaction.setFrequencyUnit(request.frequencyUnit());
            transaction.setFrequencyMultiplier(request.frequencyMultiplier());
        }
        if (request.clientGeneratedId() != null) {
            transaction.setClientGeneratedId(request.clientGeneratedId());
        }

        Long parentId = request.parentRecurringTransactionId();
        if (parentId != null) {
            Transaction parent = transactionRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Parent recurring transaction not found with id: " + parentId));
            transaction.setParentRecurringTransaction(parent);
        }

        Transaction saved = Objects.requireNonNull(
                transactionRepository.save(transaction),
                "repository.save() returned null unexpectedly.");

        if (isRecurring) {
            reminderSchedulerService.scheduleInitialReminder(saved);
            if (request.remindersEnabled() != null) {
                reminderSchedulerService.toggleReminder(saved.getId(), request.remindersEnabled());
            }
        } else if (saved.getParentRecurringTransaction() != null) {
            reminderSchedulerService.updateReminderOnInstanceLogged(saved);
        }

        recalculateUserBalance(account);
        if (saved.getCategory() != null) {
            budgetRecalcService.recalculateBudgetExpenses(account, saved.getCategory());
        }
        if (!account.isFirstTransactionAdded()) {
            account.setFirstTransactionAdded(true);
        }
        saveAccount(account);

        String prefs = String.format(
                "{\"amount\":%.2f,\"type\":\"%s\"%s%s}",
                saved.getAmount(),
                saved.getType().name(),
                saved.getCategory() != null ? ",\"categoryId\":" + saved.getCategory().getId() : "",
                saved.getPaymentMethod() != null ? ",\"paymentMethodId\":" + saved.getPaymentMethod().getId() : "");
        account.setQuickAddPreferences(prefs);
        saveAccount(account);

        return mapToResponse(saved);
    }

    public List<TransactionResponse> getTransactions(String email) {
        UserAccount account = requireAccount(email);
        Long accountId = requireAccountId(account);
        return transactionRepository.findByUserAccountIdOrderByTransactionDateDesc(accountId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsPaginated(
            String email,
            String search,
            List<Long> categoryIds,
            List<Long> paymentMethodIds,
            List<TransactionType> types,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            java.math.BigDecimal minAmount,
            java.math.BigDecimal maxAmount,
            OffsetDateTime lastDate,
            Long lastId,
            int pageSize) {
        UserAccount account = requireAccount(email);
        Long accountId = requireAccountId(account);

        org.springframework.data.jpa.domain.Specification<Transaction> spec = TransactionSpecification.filterTransactions(
                accountId, search, categoryIds, paymentMethodIds, types, startDate, endDate, minAmount, maxAmount, lastDate, lastId);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                0, pageSize, org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Order.desc("transactionDate"),
                        org.springframework.data.domain.Sort.Order.desc("id")));

        return transactionRepository.findAll(spec, pageable).getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransaction(String email, Long id) {
        UserAccount account = requireAccount(email);
        Transaction transaction = requireTransaction(id);
        validateTransactionOwnership(account, transaction);
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(String email, Long id, TransactionRequest request) {
        UserAccount account = requireAccount(email);
        Transaction transaction = requireTransaction(id);
        validateTransactionOwnership(account, transaction);
        validateRequest(request);

        Category oldCategory = transaction.getCategory();
        Category newCategory = fetchCategory(request.categoryId());
        
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setCategory(newCategory);
        transaction.setNotes((request.notes() == null || request.notes().isBlank()) ? null : request.notes());

        PaymentMethod paymentMethod = fetchPaymentMethod(request.paymentMethodId());
        transaction.setPaymentMethod(paymentMethod);

        if (request.type() == TransactionType.EXPENSE) {
            validatePaymentMethodBalance(account, paymentMethod, request.amount(), id);
        }

        if (request.transactionDate() != null) {
            transaction.setTransactionDate(request.transactionDate());
        }

        boolean isRecurring = request.isRecurring() != null && request.isRecurring();
        if (isRecurring) {
            if (request.frequencyUnit() == null) {
                throw new IllegalArgumentException("Frequency unit is required for recurring transactions.");
            }
            if (request.frequencyMultiplier() == null || request.frequencyMultiplier() <= 0) {
                throw new IllegalArgumentException(
                        "Valid frequency multiplier is required for recurring transactions.");
            }
            transaction.setIsRecurring(true);
            transaction.setFrequencyUnit(request.frequencyUnit());
            transaction.setFrequencyMultiplier(request.frequencyMultiplier());
        } else {
            transaction.setIsRecurring(false);
            transaction.setFrequencyUnit(null);
            transaction.setFrequencyMultiplier(null);
        }

        Transaction saved = Objects.requireNonNull(
                transactionRepository.save(transaction),
                "repository.save() returned null unexpectedly.");
        reminderSchedulerService.rescheduleOnFrequencyChange(saved);
        if (saved.getIsRecurring() && request.remindersEnabled() != null) {
            reminderSchedulerService.toggleReminder(saved.getId(), request.remindersEnabled());
        }

        recalculateUserBalance(account);
        if (oldCategory != null) {
            budgetRecalcService.recalculateBudgetExpenses(account, oldCategory);
        }
        if (newCategory != null && !newCategory.equals(oldCategory)) {
            budgetRecalcService.recalculateBudgetExpenses(account, newCategory);
        }
        saveAccount(account);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(String email, Long id) {
        UserAccount account = requireAccount(email);
        Transaction transaction = requireTransaction(id);
        validateTransactionOwnership(account, transaction);
        Category category = transaction.getCategory();
        attachmentService.deleteAttachmentsForTransaction(id);
        reminderSchedulerService.rescheduleOnFrequencyChange(transaction);
        transactionRepository.delete(transaction);
        recalculateUserBalance(account);
        if (category != null) {
            budgetRecalcService.recalculateBudgetExpenses(account, category);
        }
        saveAccount(account);
    }

    @Transactional
    public void bulkDeleteTransactions(String email, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        UserAccount account = requireAccount(email);
        List<Transaction> transactions = transactionRepository.findAllById(ids);
        
        // Validate ownership and collect categories
        java.util.Set<Category> categoriesToUpdate = new java.util.HashSet<>();
        for (Transaction tx : transactions) {
            validateTransactionOwnership(account, tx);
            if (tx.getCategory() != null) {
                categoriesToUpdate.add(tx.getCategory());
            }
            attachmentService.deleteAttachmentsForTransaction(tx.getId());
            reminderSchedulerService.rescheduleOnFrequencyChange(tx);
        }

        transactionRepository.deleteAllInBatch(transactions);
        transactionRepository.flush();
        
        recalculateUserBalance(account);
        for (Category category : categoriesToUpdate) {
            budgetRecalcService.recalculateBudgetExpenses(account, category);
        }
        saveAccount(account);
    }

    public java.math.BigDecimal calculatePeriodicIncome(Long userId, BudgetPeriod period) {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        OffsetDateTime start;
        OffsetDateTime end;

        if (period == BudgetPeriod.MONTHLY) {
            start = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().atOffset(ZoneOffset.UTC);
            end = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
        } else { // WEEKLY
            start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().atOffset(ZoneOffset.UTC);
            end = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
        }

        java.math.BigDecimal totalIncome = transactionRepository.sumAmountByIncomeTypeAndDateRange(userId, start, end);
        return totalIncome != null ? totalIncome : java.math.BigDecimal.ZERO;
    }

    public BalanceHistoryResponse getBalanceHistory(String email) {
        UserAccount account = requireAccount(email);
        Long accountId = requireAccountId(account);
        List<Transaction> transactions = transactionRepository.findByUserAccountIdOrderByTransactionDateDesc(accountId);
        List<Transaction> chronological = new ArrayList<>(transactions);
        chronological.sort(Comparator.comparing(Transaction::getTransactionDate).thenComparing(Transaction::getId));

        List<BalanceHistoryResponse.BalanceHistoryEntry> history = new ArrayList<>();
        java.math.BigDecimal runningBalance = java.math.BigDecimal.ZERO;

        for (Transaction t : chronological) {
            switch (t.getType()) {
                case INCOME -> runningBalance = runningBalance.add(t.getAmount());
                case EXPENSE -> runningBalance = runningBalance.subtract(t.getAmount());
                default -> throw new IllegalStateException("Unhandled TransactionType: " + t.getType());
            }
            history.add(new BalanceHistoryResponse.BalanceHistoryEntry(
                    t.getTransactionDate(),
                    runningBalance,
                    t.getDescription(),
                    t.getId(),
                    t.getType().name()));
        }

        Collections.reverse(history);
        return new BalanceHistoryResponse(history);
    }

    @Transactional
    public void recalculateUserBalance(@NonNull UserAccount account) {
        Long accountId = account.getId();
        if (accountId == null) {
            return;
        }
        java.math.BigDecimal netAmount = transactionRepository.calculateNetTransactionAmount(accountId)
                .orElse(java.math.BigDecimal.ZERO);
        account.setBalance(netAmount);
    }

    // -------------------------------------------------------------------------
    // Guard helpers
    // -------------------------------------------------------------------------

    /**
     * Resolves a {@link UserAccount} by email or throws.
     * {@code Optional.orElseThrow()} guarantees non-null at runtime but the
     * unannotated generic return type cannot be verified statically.
     */
    @NonNull
    @SuppressWarnings("null")
    private UserAccount requireAccount(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    /**
     * Unwraps an account's ID or throws.
     */
    @NonNull
    private Long requireAccountId(@NonNull UserAccount account) {
        Long id = account.getId();
        if (id == null) {
            throw new IllegalStateException("User account ID is missing.");
        }
        return id;
    }

    /**
     * Resolves a {@link Transaction} by ID or throws.
     * {@code Optional.orElseThrow()} guarantees non-null at runtime but the
     * unannotated generic return type cannot be verified statically.
     */
    @NonNull
    @SuppressWarnings("null")
    private Transaction requireTransaction(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));
    }

    /**
     * Persists a {@link UserAccount} via the repository.
     */
    private void saveAccount(@NonNull UserAccount account) {
        userAccountRepository.saveAndFlush(account);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void validateTransactionOwnership(@NonNull UserAccount account, @NonNull Transaction transaction) {
        Long accountId = account.getId();
        if (accountId == null || !transaction.getUserAccount().getId().equals(accountId)) {
            throw new IllegalArgumentException("You do not have permission to access this transaction.");
        }
    }

    private void validateRequest(TransactionRequest request) {
        if (request.amount() == null) {
            throw new IllegalArgumentException("Amount is required.");
        }
        if (request.amount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be a positive value greater than zero.");
        }
        String amountStr = request.amount().toPlainString();
        int decimalPointIndex = amountStr.indexOf('.');
        if (decimalPointIndex >= 0 && amountStr.length() - decimalPointIndex - 1 > 2) {
            throw new IllegalArgumentException("Amount cannot have more than two decimal places.");
        }
        if (request.type() == null) {
            throw new IllegalArgumentException("Transaction type is required.");
        }
    }

    private Category fetchCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
    }

    private PaymentMethod fetchPaymentMethod(Long paymentMethodId) {
        if (paymentMethodId == null) {
            return null;
        }
        return paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Payment method not found with id: " + paymentMethodId));
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
                    cat.getColor(),
                    cat.getType());
        }

        PaymentMethodResponse paymentMethodResponse = null;
        if (transaction.getPaymentMethod() != null) {
            PaymentMethod pm = transaction.getPaymentMethod();
            paymentMethodResponse = new PaymentMethodResponse(
                    pm.getId(),
                    pm.getName(),
                    pm.isGlobal(),
                    pm.getDescription());
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
                                a.getStorageReference()))
                        .collect(Collectors.toList()),
                transaction.getClientGeneratedId(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt());
    }

    private void validatePaymentMethodBalance(UserAccount account, PaymentMethod paymentMethod, java.math.BigDecimal amount, Long transactionId) {
        if (paymentMethod == null) {
            throw new IllegalArgumentException("Payment method is required.");
        }

        java.math.BigDecimal currentBalance = transactionRepository.calculateNetTransactionAmountByPaymentMethod(account.getId(), paymentMethod.getId())
            .orElse(java.math.BigDecimal.ZERO);

        if (transactionId != null) {
            Transaction existing = transactionRepository.findById(transactionId).orElse(null);
            if (existing != null && existing.getPaymentMethod().getId().equals(paymentMethod.getId()) && existing.getType() == TransactionType.EXPENSE) {
                currentBalance = currentBalance.add(existing.getAmount());
            }
        }

        if (currentBalance.compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance in " + paymentMethod.getName() + ". Available: " + currentBalance);
        }
    }
}
