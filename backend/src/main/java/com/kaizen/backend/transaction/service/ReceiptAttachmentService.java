package com.kaizen.backend.transaction.service;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kaizen.backend.transaction.entity.Transaction;
import com.kaizen.backend.transaction.entity.TransactionAttachment;
import com.kaizen.backend.transaction.repository.TransactionAttachmentRepository;
import com.kaizen.backend.transaction.repository.TransactionRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ReceiptAttachmentService {

    private final TransactionAttachmentRepository attachmentRepository;
    private final TransactionRepository transactionRepository;
    private final StorageService storageService;

    @Value("${app.storage.max-file-size:5242880}") // 5MB default
    private long maxFileSize;

    @Value("${app.storage.allowed-mime-types:image/jpeg,image/png,application/pdf}")
    private String allowedMimeTypesString;

    public ReceiptAttachmentService(
        TransactionAttachmentRepository attachmentRepository,
        TransactionRepository transactionRepository,
        StorageService storageService
    ) {
        this.attachmentRepository = attachmentRepository;
        this.transactionRepository = transactionRepository;
        this.storageService = storageService;
    }

    @Transactional
    public TransactionAttachment attachReceipt(Long transactionId, MultipartFile file) throws IOException {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + transactionId));

        validateFile(file);

        String storageReference = storageService.store(file);
        
        TransactionAttachment attachment = new TransactionAttachment(
            transaction,
            file.getOriginalFilename(),
            file.getSize(),
            file.getContentType(),
            storageReference
        );

        return attachmentRepository.save(attachment);
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB.");
        }

        String mimeType = file.getContentType();
        Set<String> allowedTypes = Set.of(allowedMimeTypesString.split(","));
        if (mimeType == null || !allowedTypes.contains(mimeType)) {
            throw new IllegalArgumentException("Unsupported file format: " + mimeType + ". Accepted formats: " + allowedMimeTypesString);
        }
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) throws IOException {
        TransactionAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Attachment not found with id: " + attachmentId));

        storageService.delete(attachment.getStorageReference());
        attachmentRepository.delete(attachment);
    }

    @Transactional
    public void deleteAttachmentsForTransaction(Long transactionId) {
        List<TransactionAttachment> attachments = attachmentRepository.findByTransactionId(transactionId);
        for (TransactionAttachment attachment : attachments) {
            try {
                storageService.delete(attachment.getStorageReference());
            } catch (IOException e) {
                log.error("Failed to delete storage file: " + attachment.getStorageReference(), e);
            }
            attachmentRepository.delete(attachment);
        }
    }

    public List<TransactionAttachment> getAttachmentsForTransaction(Long transactionId) {
        return attachmentRepository.findByTransactionId(transactionId);
    }

    public byte[] loadAttachmentContent(Long attachmentId) throws IOException {
        TransactionAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Attachment not found with id: " + attachmentId));
        
        return storageService.load(attachment.getStorageReference());
    }
}
