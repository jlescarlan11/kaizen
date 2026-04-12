package com.kaizen.backend.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.kaizen.backend.payment.entity.PaymentMethod;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PaymentMethod p WHERE p.userAccount.id = :userAccountId")
    void deleteByUserAccountId(@Param("userAccountId") Long userAccountId);

    List<PaymentMethod> findByGlobalTrue();

    List<PaymentMethod> findByUserAccountIdOrGlobalTrue(Long userAccountId);

    Optional<PaymentMethod> findByNameIgnoreCaseAndGlobalTrue(String name);

    Optional<PaymentMethod> findByNameIgnoreCaseAndUserAccountId(String name, Long userAccountId);
}
