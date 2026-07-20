package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.ClaimStatus;
import com.campusfinds.springboot_backend.model.ItemClaim;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class ClaimResponse {

    @JsonProperty("claim_id")
    private Long claimId;

    private ClaimItemDto item;
    private ClaimantDto claimant;
    private String reason;

    @JsonProperty("proof_image_url")
    private String proofImageUrl;

    private ClaimStatus status;

    @JsonProperty("moderator_remarks")
    private String moderatorRemarks;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("reviewed_at")
    private Instant reviewedAt;

    public static ClaimResponse from(ItemClaim claim) {
        ClaimResponse response = new ClaimResponse();
        response.claimId = claim.getClaimId();
        response.item = ClaimItemDto.from(claim);
        response.claimant = ClaimantDto.from(claim);
        response.reason = claim.getReason();
        response.proofImageUrl = claim.getProofImageUrl();
        response.status = claim.getStatus();
        response.moderatorRemarks = claim.getModeratorRemarks();
        response.createdAt = claim.getCreatedAt();
        response.reviewedAt = claim.getReviewedAt();
        return response;
    }

    public Long getClaimId() { return claimId; }
    public ClaimItemDto getItem() { return item; }
    public ClaimantDto getClaimant() { return claimant; }
    public String getReason() { return reason; }
    public String getProofImageUrl() { return proofImageUrl; }
    public ClaimStatus getStatus() { return status; }
    public String getModeratorRemarks() { return moderatorRemarks; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReviewedAt() { return reviewedAt; }

    public static class ClaimItemDto {
        @JsonProperty("item_id")
        private Long itemId;

        @JsonProperty("item_name")
        private String itemName;

        private String category;
        private ItemStatus status;

        static ClaimItemDto from(ItemClaim claim) {
            ClaimItemDto dto = new ClaimItemDto();
            dto.itemId = claim.getItem().getItemId();
            dto.itemName = claim.getItem().getItemName();
            dto.category = claim.getItem().getCategory();
            dto.status = claim.getItem().getStatus();
            return dto;
        }

        public Long getItemId() { return itemId; }
        public String getItemName() { return itemName; }
        public String getCategory() { return category; }
        public ItemStatus getStatus() { return status; }
    }

    public static class ClaimantDto {
        @JsonProperty("user_id")
        private Long userId;

        private String fullname;

        static ClaimantDto from(ItemClaim claim) {
            ClaimantDto dto = new ClaimantDto();
            dto.userId = claim.getClaimant().getUserId();
            dto.fullname = claim.getClaimant().getFullname();
            return dto;
        }

        public Long getUserId() { return userId; }
        public String getFullname() { return fullname; }
    }
}
