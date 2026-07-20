package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.exception.ApiExceptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_DIRECTORIES = Set.of(
            "item-images", "claim-proofs", "student-ids");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public StoredFile storeImage(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            throw new ApiExceptions.BadRequestException("No file was provided.");
        }
        if (!ALLOWED_DIRECTORIES.contains(directory)) {
            throw new ApiExceptions.BadRequestException(
                    "Directory must be item-images, claim-proofs, or student-ids.");
        }

        String extension = EXTENSIONS.get(file.getContentType());
        if (extension == null) {
            throw new ApiExceptions.BadRequestException("Only JPG, PNG, and WEBP images are supported.");
        }

        Path targetDirectory = uploadRoot.resolve(directory).normalize();
        if (!targetDirectory.startsWith(uploadRoot)) {
            throw new ApiExceptions.BadRequestException("Invalid upload directory.");
        }

        String filename = UUID.randomUUID() + extension;
        Path destination = targetDirectory.resolve(filename).normalize();

        try {
            Files.createDirectories(targetDirectory);
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store the uploaded file.", ex);
        }

        return new StoredFile(directory, filename, "/uploads/" + directory + "/" + filename);
    }

    public record StoredFile(String directory, String filename, String url) {
    }
}
