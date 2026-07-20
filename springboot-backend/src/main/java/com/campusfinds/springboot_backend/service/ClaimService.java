package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.ClaimRequest;
import com.campusfinds.springboot_backend.dto.ClaimResponse;
import com.campusfinds.springboot_backend.dto.ClaimReviewRequest;
import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.ClaimStatus;
import com.campusfinds.springboot_backend.model.Item;
import com.campusfinds.springboot_backend.model.ItemClaim;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.campusfinds.springboot_backend.model.NotificationType;
import com.campusfinds.springboot_backend.model.ReportType;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.ItemClaimRepository;
import com.campusfinds.springboot_backend.repository.ItemRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ClaimService {

    private final ItemClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public ClaimService(
            ItemClaimRepository claimRepository,
            ItemRepository itemRepository,
            CurrentUserService currentUserService,
            NotificationService notificationService,
            ActivityLogService activityLogService
    ) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> mine() {
        User claimant = currentUserService.requireCurrentUser();
        return claimRepository.findByClaimantUserIdOrderByCreatedAtDesc(claimant.getUserId()).stream()
                .map(ClaimResponse::from)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ClaimResponse> all() {
        return claimRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ClaimResponse::from)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ClaimResponse> byUser(Long userId) {
        return claimRepository.findByClaimantUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ClaimResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClaimResponse get(Long claimId) {
        User actor = currentUserService.requireCurrentUser();
        ItemClaim claim = requireClaim(claimId);
        if (!claim.getClaimant().getUserId().equals(actor.getUserId()) && !isAdmin(actor)) {
            throw new ApiExceptions.ForbiddenOperationException("You cannot view this claim.");
        }
        return ClaimResponse.from(claim);
    }

    @Transactional
    public ClaimResponse create(ClaimRequest request) {
        User claimant = currentUserService.requireCurrentUser();
        Item item = itemRepository.findByIdForUpdate(request.getItemId())
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("Item not found."));

        if (item.getReportType() != ReportType.FOUND) {
            throw new ApiExceptions.BadRequestException("Only found items can be claimed.");
        }
        if (item.getStatus() != ItemStatus.UNCLAIMED && item.getStatus() != ItemStatus.POSSIBLE_MATCH) {
            throw new ApiExceptions.ConflictException("This item is no longer available for claims.");
        }
        if (item.getReporter().getUserId().equals(claimant.getUserId())) {
            throw new ApiExceptions.ConflictException("You cannot claim an item that you reported.");
        }
        if (claimRepository.existsByItemItemIdAndClaimantUserId(item.getItemId(), claimant.getUserId())) {
            throw new ApiExceptions.ConflictException("You already submitted a claim for this item.");
        }
        validateProofUrl(request.getProofImageUrl());

        ItemClaim claim = new ItemClaim();
        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setReason(request.getReason().trim());
        claim.setProofImageUrl(trimToNull(request.getProofImageUrl()));
        claim.setStatus(ClaimStatus.PENDING);
        ItemClaim saved = claimRepository.save(claim);
        item.setStatus(ItemStatus.POSSIBLE_MATCH);

        activityLogService.record(claimant, "CLAIM_SUBMITTED",
                claimant.getFullname() + " submitted claim #" + saved.getClaimId()
                        + " for item #" + item.getItemId() + ".");
        return ClaimResponse.from(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ClaimResponse approve(Long claimId, ClaimReviewRequest request) {
        User reviewer = currentUserService.requireCurrentUser();
        ItemClaim selected = requireClaim(claimId);
        if (selected.getStatus() != ClaimStatus.PENDING) {
            throw new ApiExceptions.ConflictException("Only pending claims can be approved.");
        }

        Item item = itemRepository.findByIdForUpdate(selected.getItem().getItemId())
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("Claimed item not found."));
        if (item.getStatus() == ItemStatus.CLAIMED || item.getStatus() == ItemStatus.RESOLVED) {
            throw new ApiExceptions.ConflictException("This item has already been claimed or resolved.");
        }

        List<ItemClaim> pendingClaims = claimRepository.findByItemItemIdAndStatus(
                item.getItemId(), ClaimStatus.PENDING);
        Instant reviewedAt = Instant.now();
        String remarks = trimToNull(request.getModeratorRemarks());

        for (ItemClaim claim : pendingClaims) {
            claim.setReviewedBy(reviewer);
            claim.setReviewedAt(reviewedAt);
            if (claim.getClaimId().equals(claimId)) {
                claim.setStatus(ClaimStatus.APPROVED);
                claim.setModeratorRemarks(remarks);
                notificationService.create(
                        claim.getClaimant(),
                        NotificationType.CLAIM_APPROVED,
                        "Claim approved",
                        "Your claim for \"" + item.getItemName() + "\" was approved.",
                        item.getItemId(),
                        claim.getClaimId());
            } else {
                claim.setStatus(ClaimStatus.REJECTED);
                claim.setModeratorRemarks("Another ownership claim was approved for this item.");
                notificationService.create(
                        claim.getClaimant(),
                        NotificationType.CLAIM_REJECTED,
                        "Claim not approved",
                        "Another ownership claim was approved for \"" + item.getItemName() + "\".",
                        item.getItemId(),
                        claim.getClaimId());
            }
        }

        claimRepository.saveAll(pendingClaims);
        item.setStatus(ItemStatus.CLAIMED);
        activityLogService.record(reviewer, "CLAIM_APPROVED",
                reviewer.getFullname() + " approved claim #" + claimId + ".");
        return ClaimResponse.from(selected);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ClaimResponse reject(Long claimId, ClaimReviewRequest request) {
        User reviewer = currentUserService.requireCurrentUser();
        ItemClaim claim = requireClaim(claimId);
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new ApiExceptions.ConflictException("Only pending claims can be rejected.");
        }

        claim.setStatus(ClaimStatus.REJECTED);
        claim.setModeratorRemarks(trimToNull(request.getModeratorRemarks()));
        claim.setReviewedBy(reviewer);
        claim.setReviewedAt(Instant.now());
        ItemClaim saved = claimRepository.saveAndFlush(claim);

        Item item = claim.getItem();
        if (claimRepository.countByItemItemIdAndStatus(item.getItemId(), ClaimStatus.PENDING) == 0
                && item.getStatus() == ItemStatus.POSSIBLE_MATCH) {
            item.setStatus(ItemStatus.UNCLAIMED);
        }
        notificationService.create(
                claim.getClaimant(),
                NotificationType.CLAIM_REJECTED,
                "Claim needs more information",
                "Your claim for \"" + item.getItemName() + "\" was not approved.",
                item.getItemId(),
                claim.getClaimId());
        activityLogService.record(reviewer, "CLAIM_REJECTED",
                reviewer.getFullname() + " rejected claim #" + claimId + ".");
        return ClaimResponse.from(saved);
    }

    @Transactional
    public void delete(Long claimId) {
        User actor = currentUserService.requireCurrentUser();
        ItemClaim claim = requireClaim(claimId);
        if (!claim.getClaimant().getUserId().equals(actor.getUserId()) && !isAdmin(actor)) {
            throw new ApiExceptions.ForbiddenOperationException("You cannot delete this claim.");
        }
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new ApiExceptions.ConflictException("Only pending claims can be deleted.");
        }

        Item item = claim.getItem();
        claimRepository.delete(claim);
        claimRepository.flush();
        if (claimRepository.countByItemItemIdAndStatus(item.getItemId(), ClaimStatus.PENDING) == 0
                && item.getStatus() == ItemStatus.POSSIBLE_MATCH) {
            item.setStatus(ItemStatus.UNCLAIMED);
        }
        activityLogService.record(actor, "CLAIM_DELETED",
                actor.getFullname() + " deleted claim #" + claimId + ".");
    }

    private ItemClaim requireClaim(Long claimId) {
        return claimRepository.findById(claimId)
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("Claim not found."));
    }

    private static void validateProofUrl(String proofImageUrl) {
        if (proofImageUrl != null && !proofImageUrl.isBlank()
                && !proofImageUrl.startsWith("/uploads/claim-proofs/")) {
            throw new ApiExceptions.BadRequestException("Upload claim proof before submitting the claim.");
        }
    }

    private static boolean isAdmin(User user) {
        return "admin".equalsIgnoreCase(user.getRole());
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
