package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.Item;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.campusfinds.springboot_backend.model.ReportType;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.LocalDate;

public class ItemResponse {

    @JsonProperty("item_id")
    private Long itemId;

    @JsonProperty("item_name")
    private String itemName;

    private String category;
    private String description;
    private String location;

    @JsonProperty("event_date")
    private LocalDate eventDate;

    @JsonProperty("identifying_features")
    private String identifyingFeatures;

    private String condition;

    @JsonProperty("storage_location")
    private String storageLocation;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("report_type")
    private ReportType reportType;

    private ItemStatus status;

    @JsonProperty("related_item_id")
    private Long relatedItemId;

    @JsonProperty("reporter_id")
    private Long reporterId;

    @JsonProperty("reported_by")
    private String reportedBy;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static ItemResponse from(Item item) {
        ItemResponse response = new ItemResponse();
        response.itemId = item.getItemId();
        response.itemName = item.getItemName();
        response.category = item.getCategory();
        response.description = item.getDescription();
        response.location = item.getLocation();
        response.eventDate = item.getEventDate();
        response.identifyingFeatures = item.getIdentifyingFeatures();
        response.condition = item.getCondition();
        response.storageLocation = item.getStorageLocation();
        response.imageUrl = item.getImageUrl();
        response.reportType = item.getReportType();
        response.status = item.getStatus();
        response.relatedItemId = item.getRelatedItem() == null ? null : item.getRelatedItem().getItemId();
        response.reporterId = item.getReporter().getUserId();
        response.reportedBy = item.getReporter().getFullname();
        response.createdAt = item.getCreatedAt();
        response.updatedAt = item.getUpdatedAt();
        return response;
    }

    public Long getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public LocalDate getEventDate() { return eventDate; }
    public String getIdentifyingFeatures() { return identifyingFeatures; }
    public String getCondition() { return condition; }
    public String getStorageLocation() { return storageLocation; }
    public String getImageUrl() { return imageUrl; }
    public ReportType getReportType() { return reportType; }
    public ItemStatus getStatus() { return status; }
    public Long getRelatedItemId() { return relatedItemId; }
    public Long getReporterId() { return reporterId; }
    public String getReportedBy() { return reportedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
