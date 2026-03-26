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

    public TransactionService(
        TransactionRepository transactionRepository,
        UserAccountRepository userAccountRepository,
        CategoryRepository categoryRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userAccountRepository = userAccountRepository;
        this.categoryRepository = categoryRepository;
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

        LocalDateTime date = request.transactionDate() != null ? request.transactionDate() : LocalDateTime.now();

        Transaction transaction = new Transaction(
            account,
            category,
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
            "{\"amount\":%.2f,\"type\":\"%s\"%s}",
            saved.getAmount(),
            saved.getType().name(),
            saved.getCategory() != null ? ",\"categoryId\":" + saved.getCategory().getId() : ""
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

        return new TransactionResponse(
            transaction.getId(),
            transaction.getAmount(),
            transaction.getType(),
            transaction.getTransactionDate(),
            transaction.getDescription(),
            categoryResponse
        );
    }
}
