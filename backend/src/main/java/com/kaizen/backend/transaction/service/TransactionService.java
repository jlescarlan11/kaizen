package com.kaizen.backend.transaction.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.transaction.repository.TransactionRepository;

@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Balance calculation is now handled directly by the UserAccount.balance field.
    // Transaction updates will trigger direct updates to the UserAccount.balance in the future.
}
