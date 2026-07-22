package com.campusfinds.springboot_backend.repository;

import com.campusfinds.springboot_backend.model.Notification;
import com.campusfinds.springboot_backend.model.NotificationType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = "user")
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "user")
    Optional<Notification> findByNotificationIdAndUserUserId(Long notificationId, Long userId);

    long countByUserUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("update Notification notification set notification.read = true "
            + "where notification.user.userId = :userId and notification.read = false")
    int markAllRead(@Param("userId") Long userId);

    @Modifying
    @Query("delete from Notification notification where notification.itemId = :itemId")
    int deleteByItemId(@Param("itemId") Long itemId);

    @Modifying
    @Query("delete from Notification notification "
            + "where notification.type = :type and notification.itemId = :itemId "
            + "and notification.message = :message")
    int deleteByTypeAndItemIdAndMessage(
            @Param("type") NotificationType type,
            @Param("itemId") Long itemId,
            @Param("message") String message
    );

    @Modifying
    @Query("delete from Notification notification "
            + "where notification.type = :type and notification.itemId = :itemId")
    int deleteByTypeAndItemId(
            @Param("type") NotificationType type,
            @Param("itemId") Long itemId
    );

    void deleteByUserUserId(Long userId);
}
