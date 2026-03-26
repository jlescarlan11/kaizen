package com.kaizen.backend.transaction.entity;

import com.kaizen.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transaction_attachment")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "storage_reference", nullable = false, columnDefinition = "TEXT")
    private String storageReference;

    public TransactionAttachment(
        Transaction transaction,
        String filename,
        Long fileSize,
        String mimeType,
        String storageReference
    ) {
        this.transaction = transaction;
        this.filename = filename;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.storageReference = storageReference;
    }
}
