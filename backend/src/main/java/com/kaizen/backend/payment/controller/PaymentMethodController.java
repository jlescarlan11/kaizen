package com.kaizen.backend.payment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.payment.dto.PaymentMethodCreatePayload;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import com.kaizen.backend.payment.dto.PaymentMethodSummaryResponse;
import com.kaizen.backend.payment.service.PaymentMethodService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment-methods")
@Tag(name = "Payment Method", description = "Payment Method management APIs")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    @Operation(summary = "Get all payment methods available for the user")
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethods(userDetails.getUsername()));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get spending summary by payment method")
    public ResponseEntity<List<PaymentMethodSummaryResponse>> getPaymentMethodSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethodSummary(userDetails.getUsername()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a custom payment method")
    public PaymentMethodResponse createPaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PaymentMethodCreatePayload payload
    ) {
        return paymentMethodService.createPaymentMethod(userDetails.getUsername(), payload);
    }

    @GetMapping("/{id}/transaction-count")
    @Operation(summary = "Get count of transactions using this payment method")
    public ResponseEntity<Long> getTransactionCount(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentMethodService.countTransactionsUsingMethod(userDetails.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a custom payment method")
    public ResponseEntity<Void> deletePaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        paymentMethodService.deletePaymentMethod(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
