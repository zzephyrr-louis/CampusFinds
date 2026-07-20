package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", defaultValue = "item-images") String directory
    ) {
        FileStorageService.StoredFile storedFile = fileStorageService.storeImage(file, directory);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "File uploaded successfully.");
        response.put("directory", storedFile.directory());
        response.put("filename", storedFile.filename());
        response.put("url", storedFile.url());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
