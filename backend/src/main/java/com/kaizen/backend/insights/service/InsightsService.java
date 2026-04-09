package com.kaizen.backend.insights.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.insights.dto.BalanceTrendResponse;
import com.kaizen.backend.insights.dto.CategoryBreakdownResponse;
import com.kaizen.backend.insights.dto.SpendingSummaryResponse;
import com.kaizen.backend.insights.dto.TrendSeriesResponse;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;

@Service
@Transactional(readOnly = true)
public class InsightsService {

    private final TransactionRepository transactionRepository;
    private final UserAccountRepository userAccountRepository;

    public InsightsService(
            TransactionRepository transactionRepository,
            UserAccountRepository userAccountRepository) {
        this.transactionRepository = transactionRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public SpendingSummaryResponse getSpendingSummary(String email, LocalDateTime start, LocalDateTime end) {
        UserAccount account = getUserByEmail(email);

        BigDecimal totalIncome = transactionRepository.sumAmountByTypeAndDateRange(account.getId(),
                TransactionType.INCOME, start, end);
        BigDecimal totalExpenses = transactionRepository.sumAmountByTypeAndDateRange(account.getId(),
                TransactionType.EXPENSE, start, end);

        totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        totalExpenses = totalExpenses != null ? totalExpenses : BigDecimal.ZERO;
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        return new SpendingSummaryResponse(totalIncome, totalExpenses, netBalance);
    }

    public CategoryBreakdownResponse getCategoryBreakdown(String email, LocalDateTime start, LocalDateTime end) {
        UserAccount account = getUserByEmail(email);

        List<Object[]> results = transactionRepository.getCategoryBreakdown(account.getId(), start, end);

        BigDecimal totalExpenses = results.stream()
                .map(r -> (BigDecimal) r[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryBreakdownResponse.CategoryEntry> entries = results.stream()
                .map(r -> {
                    Long categoryId = (Long) r[0];
                    String categoryName = r[1] != null ? (String) r[1] : "Uncategorized";
                    BigDecimal total = (BigDecimal) r[2];
                    long count = (long) r[3];
                    BigDecimal percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                            ? total.multiply(BigDecimal.valueOf(100)).divide(totalExpenses, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    return new CategoryBreakdownResponse.CategoryEntry(categoryId, categoryName, total, count,
                            percentage);
                })
                .collect(Collectors.toList());

        return new CategoryBreakdownResponse(entries);
    }

    public TrendSeriesResponse getSpendingTrends(String email, LocalDateTime start, LocalDateTime end,
            String granularity) {
        UserAccount account = getUserByEmail(email);

        List<Object[]> rawData = transactionRepository.getRawTrendData(account.getId(), start, end);

        Map<LocalDate, BigDecimal> groupedData = new TreeMap<>();

        for (Object[] row : rawData) {
            LocalDateTime date = (LocalDateTime) row[0];
            BigDecimal amount = (BigDecimal) row[1];

            LocalDate periodStart;
            if ("WEEKLY".equalsIgnoreCase(granularity)) {
                periodStart = date.toLocalDate().with(java.time.DayOfWeek.MONDAY);
            } else {
                periodStart = date.toLocalDate().with(TemporalAdjusters.firstDayOfMonth());
            }

            groupedData.put(periodStart, groupedData.getOrDefault(periodStart, BigDecimal.ZERO).add(amount));
        }

        // Zero-filling
        List<TrendSeriesResponse.TrendEntry> series = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        if ("WEEKLY".equalsIgnoreCase(granularity)) {
            current = current.with(java.time.DayOfWeek.MONDAY);
        } else {
            current = current.with(TemporalAdjusters.firstDayOfMonth());
        }

        LocalDate last = end.toLocalDate();

        while (!current.isAfter(last)) {
            series.add(new TrendSeriesResponse.TrendEntry(current, groupedData.getOrDefault(current, BigDecimal.ZERO)));

            if ("WEEKLY".equalsIgnoreCase(granularity)) {
                current = current.plusWeeks(1);
            } else {
                current = current.plusMonths(1);
            }
        }

        return new TrendSeriesResponse(series);
    }

    public BalanceTrendResponse getBalanceTrends(String email, LocalDateTime start, LocalDateTime end,
            String granularity) {
        UserAccount account = getUserByEmail(email);

        List<Object[]> rawData = transactionRepository.getRawBalanceTrendData(account.getId(), start, end);

        // Map to store Income and Expenses per period
        Map<LocalDate, BigDecimal[]> groupedData = new TreeMap<>();

        for (Object[] row : rawData) {
            LocalDateTime date = (LocalDateTime) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            TransactionType type = (TransactionType) row[2];
            Boolean reconIncrease = (Boolean) row[3];

            LocalDate periodStart;
            if ("DAILY".equalsIgnoreCase(granularity)) {
                periodStart = date.toLocalDate();
            } else {
                periodStart = date.toLocalDate().with(TemporalAdjusters.firstDayOfMonth());
            }

            BigDecimal[] values = groupedData.computeIfAbsent(periodStart, k -> new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO });

            boolean isIncome = type == TransactionType.INCOME || type == TransactionType.INITIAL_BALANCE ||
                    (type == TransactionType.RECONCILIATION && Boolean.TRUE.equals(reconIncrease));

            boolean isExpense = type == TransactionType.EXPENSE ||
                    (type == TransactionType.RECONCILIATION && Boolean.FALSE.equals(reconIncrease));

            if (isIncome) {
                values[0] = values[0].add(amount);
            } else if (isExpense) {
                values[1] = values[1].add(amount);
            }
        }

        // Zero-filling
        List<BalanceTrendResponse.TrendEntry> series = new ArrayList<>();
        LocalDate current = start.toLocalDate();
        if (!"DAILY".equalsIgnoreCase(granularity)) {
            current = current.with(TemporalAdjusters.firstDayOfMonth());
        }

        LocalDate last = end.toLocalDate();
        if (!"DAILY".equalsIgnoreCase(granularity)) {
            last = last.with(TemporalAdjusters.firstDayOfMonth());
        }

        while (!current.isAfter(last)) {
            BigDecimal[] values = groupedData.getOrDefault(current, new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO });
            BigDecimal income = values[0];
            BigDecimal expenses = values[1];
            BigDecimal netBalance = income.subtract(expenses);

            series.add(new BalanceTrendResponse.TrendEntry(current, income, expenses, netBalance));

            if ("DAILY".equalsIgnoreCase(granularity)) {
                current = current.plusDays(1);
            } else {
                current = current.plusMonths(1);
            }
        }

        return new BalanceTrendResponse(series);
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
