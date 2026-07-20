package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.ClaimResponse;
import com.campusfinds.springboot_backend.dto.DashboardSummaryResponse;
import com.campusfinds.springboot_backend.dto.ItemResponse;
import com.campusfinds.springboot_backend.model.ClaimStatus;
import com.campusfinds.springboot_backend.model.ReportType;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.ItemClaimRepository;
import com.campusfinds.springboot_backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ItemRepository itemRepository;
    private final ItemClaimRepository claimRepository;
    private final ActivityLogService activityLogService;
    private final CurrentUserService currentUserService;

    public DashboardService(
            ItemRepository itemRepository,
            ItemClaimRepository claimRepository,
            ActivityLogService activityLogService,
            CurrentUserService currentUserService
    ) {
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.activityLogService = activityLogService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary() {
        User user = currentUserService.requireCurrentUser();
        boolean admin = "admin".equalsIgnoreCase(user.getRole());
        return new DashboardSummaryResponse(
                itemRepository.countByReportType(ReportType.LOST),
                itemRepository.countByReportType(ReportType.FOUND),
                claimRepository.countByStatus(ClaimStatus.PENDING),
                claimRepository.countByStatus(ClaimStatus.APPROVED),
                claimRepository.countByStatus(ClaimStatus.REJECTED),
                itemRepository.findTop5ByOrderByCreatedAtDesc().stream()
                        .map(ItemResponse::from)
                        .toList(),
                (admin
                        ? claimRepository.findTop5ByOrderByCreatedAtDesc()
                        : claimRepository.findTop5ByClaimantUserIdOrderByCreatedAtDesc(user.getUserId())).stream()
                        .map(ClaimResponse::from)
                        .toList(),
                admin ? activityLogService.recent() : java.util.List.of());
    }
}
