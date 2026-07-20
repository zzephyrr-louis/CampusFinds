package com.campusfinds.springboot_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public class ClaimReviewRequest {

    @Size(max = 2000, message = "Moderator remarks must be 2000 characters or fewer.")
    @JsonProperty("moderator_remarks")
    private String moderatorRemarks;

    public String getModeratorRemarks() {
        return moderatorRemarks;
    }

    public void setModeratorRemarks(String moderatorRemarks) {
        this.moderatorRemarks = moderatorRemarks;
    }
}
