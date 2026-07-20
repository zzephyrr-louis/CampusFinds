package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.ReportType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ItemRequest {

    @NotBlank(message = "Item name is required.")
    @Size(max = 150, message = "Item name must be 150 characters or fewer.")
    @JsonProperty("item_name")
    private String itemName;

    @NotBlank(message = "Category is required.")
    @Size(max = 80, message = "Category must be 80 characters or fewer.")
    private String category;

    @NotBlank(message = "Description is required.")
    @Size(min = 15, max = 5000, message = "Description must be between 15 and 5000 characters.")
    private String description;

    @Size(max = 3000, message = "Identifying features must be 3000 characters or fewer.")
    @JsonProperty("identifying_features")
    private String identifyingFeatures;

    @NotBlank(message = "Location is required.")
    @Size(max = 255, message = "Location must be 255 characters or fewer.")
    private String location;

    @NotNull(message = "Event date is required.")
    @PastOrPresent(message = "Event date cannot be in the future.")
    @JsonProperty("event_date")
    private LocalDate eventDate;

    @Size(max = 40, message = "Condition must be 40 characters or fewer.")
    private String condition;

    @Size(max = 255, message = "Storage location must be 255 characters or fewer.")
    @JsonProperty("storage_location")
    private String storageLocation;

    @Size(max = 500, message = "Image URL must be 500 characters or fewer.")
    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("report_type")
    private ReportType reportType;

    @JsonProperty("related_item_id")
    private Long relatedItemId;

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIdentifyingFeatures() {
        return identifyingFeatures;
    }

    public void setIdentifyingFeatures(String identifyingFeatures) {
        this.identifyingFeatures = identifyingFeatures;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public Long getRelatedItemId() {
        return relatedItemId;
    }

    public void setRelatedItemId(Long relatedItemId) {
        this.relatedItemId = relatedItemId;
    }
}
