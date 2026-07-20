package com.campusfinds.springboot_backend.repository;

import com.campusfinds.springboot_backend.model.ActivityLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @EntityGraph(attributePaths = "actor")
    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();

    @Modifying
    @Query("update ActivityLog log set log.actor = null where log.actor.userId = :userId")
    int detachActor(@Param("userId") Long userId);
}
