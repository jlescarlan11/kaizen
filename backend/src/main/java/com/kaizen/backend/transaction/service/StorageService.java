package com.kaizen.backend.transaction.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    
    /**
     * Stores a file and returns a storage reference (e.g. URL or path).
     */
    String store(MultipartFile file) throws IOException;
    
    /**
     * Deletes a file from storage.
     */
    void delete(String storageReference) throws IOException;
    
    /**
     * Retrieves the file content as bytes.
     */
    byte[] load(String storageReference) throws IOException;
}
