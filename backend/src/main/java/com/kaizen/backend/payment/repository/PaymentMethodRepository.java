package com.kaizen.backend.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kaizen.backend.payment.entity.PaymentMethod;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByGlobalTrue();

    List<PaymentMethod> findByUserAccountIdOrGlobalTrue(Long userAccountId);

    Optional<PaymentMethod> findByNameIgnoreCaseAndGlobalTrue(String name);

    Optional<PaymentMethod> findByNameIgnoreCaseAndUserAccountId(String name, Long userAccountId);
}
