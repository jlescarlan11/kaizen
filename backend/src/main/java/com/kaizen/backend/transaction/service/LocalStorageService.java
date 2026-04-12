package com.kaizen.backend.transaction.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.storage.local-path:uploads/receipts}") String localPath) throws IOException {
        this.rootLocation = Paths.get(localPath);
        if (Files.notExists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String storageName = UUID.randomUUID().toString() + extension;
        Path destinationFile = this.rootLocation.resolve(Paths.get(storageName)).normalize().toAbsolutePath();
        
        if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
            // Security check
            throw new IllegalArgumentException("Cannot store file outside current directory.");
        }
        
        Files.copy(file.getInputStream(), destinationFile);
        return storageName;
    }

    @Override
    public void delete(String storageReference) throws IOException {
        Path file = this.rootLocation.resolve(storageReference);
        Files.deleteIfExists(file);
    }

    @Override
    public byte[] load(String storageReference) throws IOException {
        Path file = this.rootLocation.resolve(storageReference);
        return Files.readAllBytes(file);
    }
}
