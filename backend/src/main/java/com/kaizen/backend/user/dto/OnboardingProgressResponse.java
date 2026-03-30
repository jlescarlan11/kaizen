package com.kaizen.backend.user.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.kaizen.backend.user.entity.OnboardingProgress;
import com.kaizen.backend.user.entity.OnboardingStep;

public record OnboardingProgressResponse(
    OnboardingStep currentStep,
    BigDecimal startingFunds,
    String fundingSourceType,
    String lastUpdatedAt,
    String description,
    String notes,
    Long paymentMethodId,
    LocalDateTime transactionDate,
    java.util.List<OnboardingRequest.InitialBalanceRequest> initialBalances
) {

    public static OnboardingProgressResponse from(OnboardingProgress progress) {
        java.util.List<OnboardingRequest.InitialBalanceRequest> initialBalances = new java.util.ArrayList<>();
        if (progress.getInitialBalances() != null) {
            try {
                initialBalances = progress.getInitialBalances().stream()
                    .map(b -> new OnboardingRequest.InitialBalanceRequest(
                        b.getPaymentMethodId(),
                        b.getAmount(),
                        b.getDescription(),
                        b.getNotes(),
                        b.getTransactionDate()
                    ))
                    .collect(java.util.stream.Collectors.toList());
            } catch (Exception e) {
                // Log error but don't fail the whole request
                System.err.println("Error mapping initial balances: " + e.getMessage());
            }
        }

        return new OnboardingProgressResponse(
            progress.getCurrentStep(),
            progress.getStartingFunds(),
            progress.getFundingSourceType() == null ? null : progress.getFundingSourceType().name(),
            progress.getUpdatedAt() != null ? progress.getUpdatedAt().toString() : null,
            progress.getInitialTransactionDescription(),
            progress.getInitialTransactionNotes(),
            progress.getInitialTransactionPaymentMethodId(),
            progress.getInitialTransactionDate(),
            initialBalances
        );
    }
}
