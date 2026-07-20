package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.dto.ActivityLogResponse;
import com.campusfinds.springboot_backend.service.ActivityLogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ActivityLogResponse> recent() {
        return activityLogService.recent();
    }
}
