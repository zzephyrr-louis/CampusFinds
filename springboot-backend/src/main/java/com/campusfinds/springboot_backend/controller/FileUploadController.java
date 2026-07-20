package com.campusfinds.springboot_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Handles file uploads and organizes them under a "directory" label, e.g.:
 *   POST /api/files/upload   (multipart form: file=<binary>, directory=student-ids)
 * saves to  uploads/student-ids/<uuid>-<originalname>
 * and returns the label + path so the frontend can store/display where it lives.
 */
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    // Only safe folder-name characters: letters, numbers, dashes, underscores.
    private static final Pattern SAFE_LABEL = Pattern.compile("^[a-zA-Z0-9_-]+$");

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", defaultValue = "general") String directory
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file was provided."));
        }

        if (!SAFE_LABEL.matcher(directory).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Directory label may only contain letters, numbers, dashes, and underscores."));
        }

        try {
            Path targetDir = Paths.get(uploadDir, directory).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String originalName = Path.of(file.getOriginalFilename() == null
                    ? "file" : file.getOriginalFilename()).getFileName().toString();
            String storedName = UUID.randomUUID() + "-" + originalName;

            Path destination = targetDir.resolve(storedName);
            file.transferTo(destination);

            String url = "/uploads/" + directory + "/" + storedName;

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "File uploaded successfully.",
                    "directory", directory,
                    "filename", storedName,
                    "url", url
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to store file."));
        }
    }
}
