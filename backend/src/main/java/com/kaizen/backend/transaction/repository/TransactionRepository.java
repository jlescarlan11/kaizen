package com.kaizen.backend.transaction.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kaizen.backend.transaction.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserAccountIdOrderByTransactionDateDesc(Long userAccountId);

    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = true THEN t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = false THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmount(@Param("userId") Long userId);

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
}
