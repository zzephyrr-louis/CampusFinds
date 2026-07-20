package com.campusfinds.springboot_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DashboardSummaryResponse {

    @JsonProperty("total_lost_items")
    private final long totalLostItems;

    @JsonProperty("total_found_items")
    private final long totalFoundItems;

    @JsonProperty("pending_claims")
    private final long pendingClaims;

    @JsonProperty("approved_claims")
    private final long approvedClaims;

    @JsonProperty("rejected_claims")
    private final long rejectedClaims;

    @JsonProperty("recent_items")
    private final List<ItemResponse> recentItems;

    @JsonProperty("recent_claims")
    private final List<ClaimResponse> recentClaims;

    @JsonProperty("recent_activity")
    private final List<ActivityLogResponse> recentActivity;

    public DashboardSummaryResponse(
            long totalLostItems,
            long totalFoundItems,
            long pendingClaims,
            long approvedClaims,
            long rejectedClaims,
            List<ItemResponse> recentItems,
            List<ClaimResponse> recentClaims,
            List<ActivityLogResponse> recentActivity
    ) {
        this.totalLostItems = totalLostItems;
        this.totalFoundItems = totalFoundItems;
        this.pendingClaims = pendingClaims;
        this.approvedClaims = approvedClaims;
        this.rejectedClaims = rejectedClaims;
        this.recentItems = recentItems;
        this.recentClaims = recentClaims;
        this.recentActivity = recentActivity;
    }

    public long getTotalLostItems() { return totalLostItems; }
    public long getTotalFoundItems() { return totalFoundItems; }
    public long getPendingClaims() { return pendingClaims; }
    public long getApprovedClaims() { return approvedClaims; }
    public long getRejectedClaims() { return rejectedClaims; }
    public List<ItemResponse> getRecentItems() { return recentItems; }
    public List<ClaimResponse> getRecentClaims() { return recentClaims; }
    public List<ActivityLogResponse> getRecentActivity() { return recentActivity; }
}
