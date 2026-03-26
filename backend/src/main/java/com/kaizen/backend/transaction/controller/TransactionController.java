package com.kaizen.backend.transaction.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
}
