package com.kaizen.backend.transaction.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.transaction.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Transaction t WHERE t.userAccount.id = :userAccountId")
    void deleteByUserAccountId(@Param("userAccountId") Long userAccountId);

    List<Transaction> findByUserAccountIdOrderByTransactionDateDesc(Long userAccountId);

    @Query("SELECT t FROM Transaction t WHERE t.userAccount.id = :userId AND " +
           "(CAST(:lastDate AS timestamp) IS NULL OR t.transactionDate < :lastDate OR " +
           "(t.transactionDate = :lastDate AND t.id < :lastId)) " +
           "ORDER BY t.transactionDate DESC, t.id DESC")
    List<Transaction> findByUserAccountIdPaginated(
        @Param("userId") Long userId,
        @Param("lastDate") LocalDateTime lastDate,
        @Param("lastId") Long lastId,
        org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'INITIAL_BALANCE' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = true THEN t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = false THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmount(@Param("userId") Long userId);

    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'INITIAL_BALANCE' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = true THEN t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = false THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId AND t.paymentMethod.id = :paymentMethodId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmountByPaymentMethod(@Param("userId") Long userId, @Param("paymentMethodId") Long paymentMethodId);

    long countByCategoryId(Long categoryId);

    @Modifying
    @Query("UPDATE Transaction t SET t.category.id = :targetId WHERE t.category.id = :sourceId")
    int updateCategoryId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);

    boolean existsByCategoryId(Long categoryId);

    long countByPaymentMethodId(Long paymentMethodId);

    @Modifying
    @Query("UPDATE Transaction t SET t.paymentMethod = null WHERE t.paymentMethod.id = :paymentMethodId")
    void setPaymentMethodToNull(@Param("paymentMethodId") Long paymentMethodId);

    @Query("SELECT t.paymentMethod.id, SUM(t.amount) FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.paymentMethod IS NOT NULL GROUP BY t.paymentMethod.id")
    List<Object[]> getExpenseSummaryGroupedByPaymentMethod(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.paymentMethod IS NULL")
    java.math.BigDecimal getUnspecifiedExpenseSummary(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = :type AND t.transactionDate >= :start AND t.transactionDate <= :end")
    java.math.BigDecimal sumAmountByTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("type") com.kaizen.backend.common.entity.TransactionType type,
        @Param("start") java.time.LocalDateTime start,
        @Param("end") java.time.LocalDateTime end
    );

    @Query("SELECT t.category.id, t.category.name, SUM(t.amount), COUNT(t.id) " +
           "FROM Transaction t " +
           "WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end " +
           "GROUP BY t.category.id, t.category.name " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> getCategoryBreakdown(
        @Param("userId") Long userId,
        @Param("start") java.time.LocalDateTime start,
        @Param("end") java.time.LocalDateTime end
    );

    @Query("SELECT t.transactionDate, t.amount FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end ORDER BY t.transactionDate ASC")
    List<Object[]> getRawTrendData(
        @Param("userId") Long userId,
        @Param("start") java.time.LocalDateTime start,
        @Param("end") java.time.LocalDateTime end
    );

    Optional<Transaction> findByClientGeneratedId(String clientGeneratedId);

    boolean existsByClientGeneratedId(String clientGeneratedId);
}
