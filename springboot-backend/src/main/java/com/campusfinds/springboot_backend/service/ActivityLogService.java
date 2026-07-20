package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.ActivityLogResponse;
import com.campusfinds.springboot_backend.model.ActivityLog;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public void record(User actor, String action, String details) {
        ActivityLog log = new ActivityLog();
        log.setActor(actor);
        log.setAction(action);
        log.setDetails(details);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> recent() {
        return activityLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(ActivityLogResponse::from)
                .toList();
    }

    @Transactional
    public void detachActor(Long userId) {
        activityLogRepository.detachActor(userId);
    }
}
