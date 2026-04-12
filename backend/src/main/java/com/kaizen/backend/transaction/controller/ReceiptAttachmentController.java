package com.kaizen.backend.transaction.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kaizen.backend.transaction.dto.AttachmentResponse;
import com.kaizen.backend.transaction.entity.TransactionAttachment;
import com.kaizen.backend.transaction.service.ReceiptAttachmentService;

@RestController
@RequestMapping("/api/transactions")
public class ReceiptAttachmentController {

    private final ReceiptAttachmentService attachmentService;

    public ReceiptAttachmentController(ReceiptAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{transactionId}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long transactionId,
            @RequestParam("file") MultipartFile file) throws IOException {
        TransactionAttachment attachment = attachmentService.attachReceipt(transactionId, file);
        return ResponseEntity.ok(mapToResponse(attachment));
    }

    @GetMapping("/{transactionId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long transactionId) {
        List<TransactionAttachment> attachments = attachmentService.getAttachmentsForTransaction(transactionId);
        return ResponseEntity.ok(attachments.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) throws IOException {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/attachments/{attachmentId}/content")
    public ResponseEntity<byte[]> getAttachmentContent(@PathVariable Long attachmentId) throws IOException {
        byte[] content = attachmentService.loadAttachmentContent(attachmentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .body(content);
    }

    private AttachmentResponse mapToResponse(TransactionAttachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFilename(),
                attachment.getFileSize(),
                attachment.getMimeType(),
                attachment.getStorageReference());
    }
}
