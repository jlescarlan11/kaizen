package com.kaizen.backend.transaction.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserAccountRepository userAccountRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    public TransactionService(
        TransactionRepository transactionRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository,
        PaymentMethodRepository paymentMethodRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.categoryId()));
        }

        PaymentMethod paymentMethod = null;
        if (request.paymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + request.paymentMethodId()));
        }

        LocalDateTime date = request.transactionDate() != null ? request.transactionDate() : LocalDateTime.now();

        Transaction transaction = new Transaction(
            account,
            category,
            paymentMethod,
            request.amount(),
            request.type(),
            request.description(),
            date
        );

        Transaction saved = transactionRepository.save(transaction);

        // Instruction 3: Balance Recalculation on Save
        if (saved.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(saved.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(saved.getAmount()));
        }

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

    public TransactionResponse getTransaction(String email, Long id) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        if (!transaction.getUserAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("You do not have permission to view this transaction.");
        }

        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(String email, Long id, TransactionRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        if (!transaction.getUserAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("You do not have permission to update this transaction.");
        }

        // Revert old transaction impact on balance
        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        }

        // Update fields
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.categoryId()));
        }

        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setCategory(category);

        PaymentMethod paymentMethod = null;
        if (request.paymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with id: " + request.paymentMethodId()));
        }
        transaction.setPaymentMethod(paymentMethod);

        if (request.transactionDate() != null) {
            transaction.setTransactionDate(request.transactionDate());
        }

        Transaction saved = transactionRepository.save(transaction);

        // Apply new transaction impact on balance
        if (saved.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(saved.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(saved.getAmount()));
        }

        userAccountRepository.save(account);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(String email, Long id) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        if (!transaction.getUserAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("You do not have permission to delete this transaction.");
        }

        // Revert transaction impact on balance
        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        }

        transactionRepository.delete(transaction);
        userAccountRepository.save(account);
    }

    @Transactional
    public void bulkDeleteTransactions(String email, List<Long> ids) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        List<Transaction> transactions = transactionRepository.findAllById(ids);

        for (Transaction transaction : transactions) {
            if (!transaction.getUserAccount().getId().equals(account.getId())) {
                throw new IllegalArgumentException("You do not have permission to delete transaction with id: " + transaction.getId());
            }

            // Revert transaction impact on balance
            if (transaction.getType() == TransactionType.INCOME) {
                account.setBalance(account.getBalance().subtract(transaction.getAmount()));
            } else {
                account.setBalance(account.getBalance().add(transaction.getAmount()));
            }
        }

        transactionRepository.deleteAll(transactions);
        userAccountRepository.save(account);
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

        return new TransactionResponse(
            transaction.getId(),
            transaction.getAmount(),
            transaction.getType(),
            transaction.getTransactionDate(),
            transaction.getDescription(),
            categoryResponse,
            paymentMethodResponse
        );
    }
}
