package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.Notification;
import com.campusfinds.springboot_backend.model.NotificationType;

import java.time.Instant;
import java.util.Locale;

/**
 * Uses the camel-case presentation shape already consumed by the React
 * notification components.
 */
public class NotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String message;
    private Long itemId;
    private Long claimId;
    private Instant createdAt;
    private boolean read;

    public static NotificationResponse from(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.id = notification.getNotificationId();
        response.type = toPresentationType(notification.getType());
        response.title = notification.getTitle();
        response.message = notification.getMessage();
        response.itemId = notification.getItemId();
        response.claimId = notification.getClaimId();
        response.createdAt = notification.getCreatedAt();
        response.read = notification.isRead();
        return response;
    }

    private static String toPresentationType(NotificationType type) {
        return type.name().toLowerCase(Locale.ROOT).replace('_', '-');
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Long getItemId() { return itemId; }
    public Long getClaimId() { return claimId; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isRead() { return read; }
}
