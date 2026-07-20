package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.ActivityLog;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class ActivityLogResponse {

    @JsonProperty("activity_id")
    private Long activityId;

    private String action;
    private String details;

    @JsonProperty("actor_name")
    private String actorName;

    @JsonProperty("created_at")
    private Instant createdAt;

    public static ActivityLogResponse from(ActivityLog log) {
        ActivityLogResponse response = new ActivityLogResponse();
        response.activityId = log.getActivityId();
        response.action = log.getAction();
        response.details = log.getDetails();
        response.actorName = log.getActor() == null ? "System" : log.getActor().getFullname();
        response.createdAt = log.getCreatedAt();
        return response;
    }

    public Long getActivityId() { return activityId; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public String getActorName() { return actorName; }
    public Instant getCreatedAt() { return createdAt; }
}
