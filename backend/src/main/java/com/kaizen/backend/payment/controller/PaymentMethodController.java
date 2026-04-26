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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.common.dto.ValidationErrorResponse;
import com.kaizen.backend.payment.dto.PaymentMethodCreatePayload;
import com.kaizen.backend.payment.dto.PaymentMethodResponse;
import com.kaizen.backend.payment.dto.PaymentMethodSummaryResponse;
import com.kaizen.backend.payment.service.PaymentMethodService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Payment methods returned successfully.",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PaymentMethodResponse.class)))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethods(userDetails.getUsername()));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get spending summary by payment method")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Payment method spending summary returned successfully.",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PaymentMethodSummaryResponse.class)))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<List<PaymentMethodSummaryResponse>> getPaymentMethodSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethodSummary(userDetails.getUsername()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a custom payment method")
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Payment method created successfully.",
            content = @Content(schema = @Schema(implementation = PaymentMethodResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Payload validation failed.",
            content = @Content(schema = @Schema(implementation = ValidationErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public PaymentMethodResponse createPaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PaymentMethodCreatePayload payload
    ) {
        return paymentMethodService.createPaymentMethod(userDetails.getUsername(), payload);
    }

    @GetMapping("/{id}/transaction-count")
    @Operation(summary = "Get count of transactions using this payment method")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Transaction count returned successfully."
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Payment method not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<Long> getTransactionCount(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentMethodService.countTransactionsUsingMethod(userDetails.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a custom payment method")
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Payment method deleted successfully."
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Cannot delete a system payment method.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Payment method not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<Void> deletePaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        paymentMethodService.deletePaymentMethod(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
