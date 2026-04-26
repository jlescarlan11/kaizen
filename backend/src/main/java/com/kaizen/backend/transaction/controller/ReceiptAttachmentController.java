package com.kaizen.backend.transaction.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.transaction.dto.AttachmentResponse;
import com.kaizen.backend.transaction.entity.TransactionAttachment;
import com.kaizen.backend.transaction.service.ReceiptAttachmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Receipt Attachment", description = "Transaction receipt attachment management.")
@RestController
@RequestMapping("/api/transactions")
public class ReceiptAttachmentController {

    private final ReceiptAttachmentService attachmentService;

    public ReceiptAttachmentController(ReceiptAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @Operation(summary = "Upload a receipt attachment", description = "Attaches a receipt file to the specified transaction.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Attachment uploaded successfully.",
            content = @Content(schema = @Schema(implementation = AttachmentResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid file or payload.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Transaction not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping("/{transactionId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse uploadAttachment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long transactionId,
            @RequestParam("file") MultipartFile file) throws IOException {
        TransactionAttachment attachment = attachmentService.attachReceipt(userDetails.getUsername(), transactionId, file);
        return mapToResponse(attachment);
    }

    @Operation(summary = "List attachments for a transaction", description = "Returns all receipt attachments associated with the specified transaction.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Attachments returned successfully.",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = AttachmentResponse.class)))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Transaction not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @GetMapping("/{transactionId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long transactionId) {
        List<TransactionAttachment> attachments = attachmentService.getAttachmentsForTransaction(userDetails.getUsername(), transactionId);
        return ResponseEntity.ok(attachments.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @Operation(summary = "Delete a receipt attachment", description = "Removes the specified attachment from storage and the database.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Attachment deleted successfully."
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Attachment not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long attachmentId) throws IOException {
        attachmentService.deleteAttachment(userDetails.getUsername(), attachmentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Download attachment content", description = "Returns the raw file bytes for the specified attachment.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "File content returned successfully.",
            content = @Content(schema = @Schema(type = "string", format = "binary"))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User must be authenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Attachment not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @GetMapping("/attachments/{attachmentId}/content")
    public ResponseEntity<byte[]> getAttachmentContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long attachmentId) throws IOException {
        byte[] content = attachmentService.loadAttachmentContent(userDetails.getUsername(), attachmentId);
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
