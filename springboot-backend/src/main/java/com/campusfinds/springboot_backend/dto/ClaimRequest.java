package com.campusfinds.springboot_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClaimRequest {

    @NotNull(message = "Item ID is required.")
    @JsonProperty("item_id")
    private Long itemId;

    @NotBlank(message = "Claim reason is required.")
    @Size(min = 10, max = 5000, message = "Claim reason must be between 10 and 5000 characters.")
    private String reason;

    @Size(max = 500, message = "Proof image URL must be 500 characters or fewer.")
    @JsonProperty("proof_image_url")
    private String proofImageUrl;

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public void setProofImageUrl(String proofImageUrl) {
        this.proofImageUrl = proofImageUrl;
    }
}
