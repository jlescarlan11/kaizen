package com.kaizen.backend.insights.controller;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.insights.dto.BalanceTrendResponse;
import com.kaizen.backend.insights.dto.CategoryBreakdownResponse;
import com.kaizen.backend.insights.dto.SpendingSummaryResponse;
import com.kaizen.backend.insights.dto.TrendSeriesResponse;
import com.kaizen.backend.insights.service.InsightsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/insights")
@Tag(name = "Insights", description = "Endpoints for financial insights and analytics")
public class InsightsController {

    private final InsightsService insightsService;

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get spending summary for a date range")
    public ResponseEntity<SpendingSummaryResponse> getSpendingSummary(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
        @RequestParam(required = false) List<Long> paymentMethodIds
    ) {
        return ResponseEntity.ok(insightsService.getSpendingSummary(userDetails.getUsername(), start, end, paymentMethodIds));
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get expense breakdown by category for a date range")
    public ResponseEntity<CategoryBreakdownResponse> getCategoryBreakdown(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
        @RequestParam(required = false) List<Long> paymentMethodIds
    ) {
        return ResponseEntity.ok(insightsService.getCategoryBreakdown(userDetails.getUsername(), start, end, paymentMethodIds));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get spending trends for a date range")
    public ResponseEntity<TrendSeriesResponse> getSpendingTrends(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
        @RequestParam(defaultValue = "MONTHLY") String granularity,
        @RequestParam(required = false) List<Long> paymentMethodIds
    ) {
        return ResponseEntity.ok(insightsService.getSpendingTrends(userDetails.getUsername(), start, end, granularity, paymentMethodIds));
    }

    @GetMapping("/balance-trends")
    @Operation(summary = "Get income vs expense vs net balance trends for a date range")
    public ResponseEntity<BalanceTrendResponse> getBalanceTrends(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
        @RequestParam(defaultValue = "MONTHLY") String granularity,
        @RequestParam(required = false) List<Long> paymentMethodIds
    ) {
        return ResponseEntity.ok(insightsService.getBalanceTrends(userDetails.getUsername(), start, end, granularity, paymentMethodIds));
    }
}
