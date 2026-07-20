package com.campusfinds.springboot_backend.repository;

import com.campusfinds.springboot_backend.model.ClaimStatus;
import com.campusfinds.springboot_backend.model.ItemClaim;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemClaimRepository extends JpaRepository<ItemClaim, Long> {

    boolean existsByItemItemIdAndClaimantUserId(Long itemId, Long claimantId);

    boolean existsByClaimantUserId(Long userId);

    boolean existsByReviewedByUserId(Long userId);

    @EntityGraph(attributePaths = {"item", "claimant", "reviewedBy"})
    List<ItemClaim> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"item", "claimant", "reviewedBy"})
    List<ItemClaim> findByClaimantUserIdOrderByCreatedAtDesc(Long claimantId);

    @EntityGraph(attributePaths = {"item", "claimant", "reviewedBy"})
    List<ItemClaim> findByItemItemIdAndStatus(Long itemId, ClaimStatus status);

    @EntityGraph(attributePaths = {"item", "claimant", "reviewedBy"})
    List<ItemClaim> findTop5ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"item", "claimant", "reviewedBy"})
    List<ItemClaim> findTop5ByClaimantUserIdOrderByCreatedAtDesc(Long claimantId);

    long countByStatus(ClaimStatus status);

    long countByItemItemIdAndStatus(Long itemId, ClaimStatus status);

    void deleteByItemItemId(Long itemId);
}
