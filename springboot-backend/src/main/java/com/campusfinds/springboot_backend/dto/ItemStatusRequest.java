package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.ItemStatus;
import jakarta.validation.constraints.NotNull;

public class ItemStatusRequest {

    @NotNull(message = "Status is required.")
    private ItemStatus status;

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }
}
