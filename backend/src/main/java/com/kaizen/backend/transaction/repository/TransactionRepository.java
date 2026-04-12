package com.kaizen.backend.transaction.repository;

import java.time.OffsetDateTime;
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
        @Param("lastDate") OffsetDateTime lastDate,
        @Param("lastId") Long lastId,
        org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmount(@Param("userId") Long userId);

    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
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

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = :type AND t.transactionDate >= :start AND t.transactionDate <= :end " +
           "AND (:paymentMethodIds IS NULL OR t.paymentMethod.id IN :paymentMethodIds)")
    java.math.BigDecimal sumAmountByTypeDateRangeAndPaymentMethods(
        @Param("userId") Long userId,
        @Param("type") com.kaizen.backend.common.entity.TransactionType type,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end,
        @Param("paymentMethodIds") List<Long> paymentMethodIds
    );

    @Query("SELECT t.category.id, t.category.name, SUM(t.amount), COUNT(t.id) " +
           "FROM Transaction t " +
           "WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end " +
           "AND (:paymentMethodIds IS NULL OR t.paymentMethod.id IN :paymentMethodIds) " +
           "GROUP BY t.category.id, t.category.name " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> getCategoryBreakdownWithPaymentMethods(
        @Param("userId") Long userId,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end,
        @Param("paymentMethodIds") List<Long> paymentMethodIds
    );

    @Query("SELECT t.transactionDate, t.amount FROM Transaction t WHERE t.userAccount.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end " +
           "AND (:paymentMethodIds IS NULL OR t.paymentMethod.id IN :paymentMethodIds) " +
           "ORDER BY t.transactionDate ASC")
    List<Object[]> getRawTrendDataWithPaymentMethods(
        @Param("userId") Long userId,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end,
        @Param("paymentMethodIds") List<Long> paymentMethodIds
    );

    @Query("SELECT t.transactionDate, t.amount, t.type FROM Transaction t WHERE t.userAccount.id = :userId AND t.transactionDate >= :start AND t.transactionDate <= :end " +
           "AND (:paymentMethodIds IS NULL OR t.paymentMethod.id IN :paymentMethodIds) " +
           "ORDER BY t.transactionDate ASC")
    List<Object[]> getRawBalanceTrendDataWithPaymentMethods(
        @Param("userId") Long userId,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end,
        @Param("paymentMethodIds") List<Long> paymentMethodIds
    );

    @Query("SELECT CAST(t.transactionDate AS date), " +
           "SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t " +
           "WHERE t.userAccount.id = :userId AND t.paymentMethod.id = :paymentMethodId " +
           "AND t.transactionDate >= :start " +
           "GROUP BY CAST(t.transactionDate AS date) " +
           "ORDER BY CAST(t.transactionDate AS date) ASC")
    List<Object[]> getDailyBalanceChangesByPaymentMethod(
        @Param("userId") Long userId,
        @Param("paymentMethodId") Long paymentMethodId,
        @Param("start") OffsetDateTime start
    );

    Optional<Transaction> findByClientGeneratedId(String clientGeneratedId);

    boolean existsByClientGeneratedId(String clientGeneratedId);
}
