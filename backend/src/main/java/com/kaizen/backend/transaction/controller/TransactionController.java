package com.kaizen.backend.transaction.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.transaction.dto.BalanceHistoryResponse;
import com.kaizen.backend.transaction.dto.BulkDeleteRequest;
import com.kaizen.backend.transaction.dto.ReconciliationRequest;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;

@Tag(name = "Transaction", description = "Transaction management.")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Operation(
        summary = "Create a new transaction",
        description = "Saves a new transaction and updates the user's running balance."
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.createTransaction(userDetails.getUsername(), request);
    }

    @Operation(
        summary = "Get all transactions for the current user",
        description = "Returns a list of transactions ordered by date descending."
    )
    @GetMapping
    public List<TransactionResponse> getTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        return transactionService.getTransactions(userDetails.getUsername());
    }

    @Operation(
        summary = "Get a single transaction",
        description = "Returns details of a specific transaction by ID."
    )
    @GetMapping("/{id}")
    public TransactionResponse getTransaction(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        return transactionService.getTransaction(userDetails.getUsername(), id);
    }

    @Operation(
        summary = "Update an existing transaction",
        description = "Updates an existing transaction and recalculates the user's running balance."
    )
    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id,
        @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.updateTransaction(userDetails.getUsername(), id, request);
    }

    @Operation(
        summary = "Delete a transaction",
        description = "Permanently removes a transaction and recalculates the user's running balance."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransaction(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        transactionService.deleteTransaction(userDetails.getUsername(), id);
    }

    @Operation(
        summary = "Bulk delete transactions",
        description = "Permanently removes multiple transactions and recalculates the user's running balance."
    )
    @PostMapping("/bulk-delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkDeleteTransactions(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody BulkDeleteRequest request
    ) {
        transactionService.bulkDeleteTransactions(userDetails.getUsername(), request.ids());
    }

    @Operation(
        summary = "Reconcile balance",
        description = "Creates a reconciliation adjustment transaction to match the app balance with the real-world balance."
    )
    @PostMapping("/reconcile")
    public TransactionResponse reconcileBalance(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody ReconciliationRequest request
    ) {
        return transactionService.reconcileBalance(userDetails.getUsername(), request.realWorldBalance(), request.description());
    }

    @Operation(
        summary = "Get balance history",
        description = "Returns a chronological history of the user's balance."
    )
    @GetMapping("/history")
    public BalanceHistoryResponse getBalanceHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return transactionService.getBalanceHistory(userDetails.getUsername());
    }
}
