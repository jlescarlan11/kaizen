package com.kaizen.backend.transaction.dto;

public record AttachmentResponse(
    Long id,
    String filename,
    Long fileSize,
    String mimeType,
    String storageReference
) {}
