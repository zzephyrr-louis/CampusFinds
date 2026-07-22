package com.campusfinds.springboot_backend;

import com.campusfinds.springboot_backend.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class FileStorageServiceTests {

    @Test
    void itemImageDeletionAcceptsOnlyManagedPaths(@TempDir Path uploadRoot) throws Exception {
        FileStorageService fileStorageService = new FileStorageService(uploadRoot.toString());
        FileStorageService.StoredFile stored = fileStorageService.storeImage(
                new MockMultipartFile(
                        "file", "item.png", "image/png", "test-image".getBytes()),
                "item-images");
        Path storedPath = uploadRoot.resolve(stored.directory()).resolve(stored.filename());
        Path outsidePath = uploadRoot.resolve("outside.png");
        Files.writeString(outsidePath, "must remain");

        assertThat(fileStorageService.deleteItemImage("https://example.com/item.png")).isFalse();
        assertThat(fileStorageService.deleteItemImage("/uploads/item-images/../outside.png")).isFalse();
        assertThat(Files.exists(outsidePath)).isTrue();
        assertThat(Files.exists(storedPath)).isTrue();

        assertThat(fileStorageService.deleteItemImage(stored.url())).isTrue();
        assertThat(Files.exists(storedPath)).isFalse();
        assertThat(Files.exists(outsidePath)).isTrue();
    }
}
