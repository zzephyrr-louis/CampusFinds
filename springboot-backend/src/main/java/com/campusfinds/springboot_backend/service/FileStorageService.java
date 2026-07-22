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
import java.util.regex.Pattern;

@Service
public class FileStorageService {

    private static final String ITEM_IMAGES_DIRECTORY = "item-images";
    private static final Set<String> ALLOWED_DIRECTORIES = Set.of(
            ITEM_IMAGES_DIRECTORY, "claim-proofs", "student-ids");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");
    private static final Pattern MANAGED_IMAGE_FILENAME = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.(?:jpg|png|webp)$",
            Pattern.CASE_INSENSITIVE);

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

    public boolean deleteItemImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return false;

        String prefix = "/uploads/" + ITEM_IMAGES_DIRECTORY + "/";
        if (!imageUrl.startsWith(prefix)) return false;

        String filename = imageUrl.substring(prefix.length());
        if (!MANAGED_IMAGE_FILENAME.matcher(filename).matches()) return false;

        Path targetDirectory = uploadRoot.resolve(ITEM_IMAGES_DIRECTORY).normalize();
        Path target = targetDirectory.resolve(filename).normalize();
        if (!target.startsWith(uploadRoot)
                || !target.getParent().equals(targetDirectory)
                || Files.isSymbolicLink(targetDirectory)) {
            return false;
        }

        try {
            return Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete the stored item image.", ex);
        }
    }

    public record StoredFile(String directory, String filename, String url) {
    }
}
