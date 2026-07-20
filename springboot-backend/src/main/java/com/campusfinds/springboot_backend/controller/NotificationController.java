package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.dto.NotificationResponse;
import com.campusfinds.springboot_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> mine() {
        return notificationService.mine();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("unreadCount", notificationService.unreadCount());
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markRead(@PathVariable Long notificationId) {
        return notificationService.markRead(notificationId);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead() {
        int updated = notificationService.markAllRead();
        return ResponseEntity.ok(Map.of(
                "message", "Notifications marked as read.",
                "updated", updated));
    }
}
