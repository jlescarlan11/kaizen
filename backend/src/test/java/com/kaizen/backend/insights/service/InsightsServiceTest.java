package com.kaizen.backend.insights.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.insights.dto.CategoryBreakdownResponse;
import com.kaizen.backend.insights.dto.SpendingSummaryResponse;
import com.kaizen.backend.insights.dto.TrendSeriesResponse;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class InsightsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @InjectMocks
    private InsightsService insightsService;

    @Mock
    private UserAccount testAccount;

    private final String email = "test@example.com";

    @BeforeEach
    void setUp() {
        when(testAccount.getId()).thenReturn(1L);
    }

    @Test
    void getSpendingSummary_ShouldReturnCorrectTotals() {
        LocalDateTime start = LocalDateTime.now().minusMonths(1);
        LocalDateTime end = LocalDateTime.now();

        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(testAccount));
        when(transactionRepository.sumAmountByTypeAndDateRange(eq(1L), eq(TransactionType.INCOME), any(), any()))
            .thenReturn(new BigDecimal("1000.00"));
        when(transactionRepository.sumAmountByTypeAndDateRange(eq(1L), eq(TransactionType.EXPENSE), any(), any()))
            .thenReturn(new BigDecimal("600.00"));

        SpendingSummaryResponse summary = insightsService.getSpendingSummary(email, start, end);

        assertEquals(new BigDecimal("1000.00"), summary.totalIncome());
        assertEquals(new BigDecimal("600.00"), summary.totalExpenses());
        assertEquals(new BigDecimal("400.00"), summary.netBalance());
    }

    @Test
    void getCategoryBreakdown_ShouldCalculatePercentages() {
        LocalDateTime start = LocalDateTime.now().minusMonths(1);
        LocalDateTime end = LocalDateTime.now();

        List<Object[]> queryResults = new ArrayList<>();
        queryResults.add(new Object[]{1L, "Food", new BigDecimal("300.00"), 5L});
        queryResults.add(new Object[]{2L, "Rent", new BigDecimal("700.00"), 1L});

        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(testAccount));
        when(transactionRepository.getCategoryBreakdown(eq(1L), any(), any())).thenReturn(queryResults);

        CategoryBreakdownResponse breakdown = insightsService.getCategoryBreakdown(email, start, end);

        assertEquals(2, breakdown.categories().size());
        assertEquals(new BigDecimal("30.00"), breakdown.categories().get(0).percentage()); // 300 / 1000
        assertEquals(new BigDecimal("70.00"), breakdown.categories().get(1).percentage()); // 700 / 1000
    }

    @Test
    void getSpendingTrends_ShouldIncludeZeroFilling() {
        LocalDateTime start = LocalDateTime.of(2023, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2023, 3, 31, 23, 59);

        List<Object[]> rawData = new ArrayList<>();
        rawData.add(new Object[]{LocalDateTime.of(2023, 1, 15, 10, 0), new BigDecimal("100.00")});
        rawData.add(new Object[]{LocalDateTime.of(2023, 3, 5, 12, 0), new BigDecimal("200.00")});

        when(userAccountRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(testAccount));
        when(transactionRepository.getRawTrendData(eq(1L), any(), any())).thenReturn(rawData);

        TrendSeriesResponse trends = insightsService.getSpendingTrends(email, start, end, "MONTHLY");

        assertEquals(3, trends.series().size()); // Jan, Feb, Mar
        assertEquals(new BigDecimal("100.00"), trends.series().get(0).total()); // Jan
        assertEquals(BigDecimal.ZERO, trends.series().get(1).total()); // Feb (Zero filled)
        assertEquals(new BigDecimal("200.00"), trends.series().get(2).total()); // Mar
    }
}
