package com.kaizen.backend.transaction.repository;

import com.kaizen.backend.transaction.entity.TransactionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionAttachmentRepository extends JpaRepository<TransactionAttachment, Long> {
    List<TransactionAttachment> findByTransactionId(Long transactionId);
}
