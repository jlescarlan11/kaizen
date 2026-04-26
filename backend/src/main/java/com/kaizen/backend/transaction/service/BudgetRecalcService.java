package com.kaizen.backend.transaction.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.lang.NonNull;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import com.kaizen.backend.user.entity.UserAccount;

/**
 * Extracted from TransactionService so @Retryable on
 * recalculateBudgetExpenses fires through Spring's AOP proxy
 * (self-invocation inside TransactionService bypasses the proxy).
 * See audit finding B-BE-1.
 */
@Service
public class BudgetRecalcService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetRecalcService(
            BudgetRepository budgetRepository,
            TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    @Retryable(
        retryFor = OptimisticLockingFailureException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 50, multiplier = 2.0, maxDelay = 500)
    )
    @Transactional
    public void recalculateBudgetExpenses(@NonNull UserAccount account, @NonNull Category category) {
        budgetRepository.findByUserIdAndCategoryId(account.getId(), category.getId())
            .ifPresent(budget -> {
                LocalDate now = LocalDate.now(ZoneOffset.UTC);
                OffsetDateTime start;
                OffsetDateTime end;

                if (budget.getPeriod() == BudgetPeriod.MONTHLY) {
                    start = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().atOffset(ZoneOffset.UTC);
                    end = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
                } else { // WEEKLY
                    start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().atOffset(ZoneOffset.UTC);
                    end = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
                }

                BigDecimal totalExpense = transactionRepository.sumAmountByCategoryIdAndTypeAndDateRange(
                    account.getId(), category.getId(), TransactionType.EXPENSE, start, end);

                budget.setExpense(totalExpense != null ? totalExpense : BigDecimal.ZERO);
                budgetRepository.saveAndFlush(budget);
            });
    }
}
