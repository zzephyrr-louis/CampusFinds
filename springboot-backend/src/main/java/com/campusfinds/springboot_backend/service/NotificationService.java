package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.NotificationResponse;
import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.Notification;
import com.campusfinds.springboot_backend.model.NotificationType;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(
            NotificationRepository notificationRepository,
            CurrentUserService currentUserService
    ) {
        this.notificationRepository = notificationRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public Notification create(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Long itemId,
            Long claimId
    ) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setItemId(itemId);
        notification.setClaimId(claimId);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> mine() {
        User user = currentUserService.requireCurrentUser();
        return notificationRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId()).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        User user = currentUserService.requireCurrentUser();
        return notificationRepository.countByUserUserIdAndReadFalse(user.getUserId());
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        User user = currentUserService.requireCurrentUser();
        Notification notification = notificationRepository
                .findByNotificationIdAndUserUserId(notificationId, user.getUserId())
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("Notification not found."));
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllRead() {
        User user = currentUserService.requireCurrentUser();
        return notificationRepository.markAllRead(user.getUserId());
    }
}
