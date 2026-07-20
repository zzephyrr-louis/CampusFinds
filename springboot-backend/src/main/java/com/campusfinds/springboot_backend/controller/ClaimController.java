package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.dto.ClaimRequest;
import com.campusfinds.springboot_backend.dto.ClaimResponse;
import com.campusfinds.springboot_backend.dto.ClaimReviewRequest;
import com.campusfinds.springboot_backend.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    public List<ClaimResponse> all() {
        return claimService.all();
    }

    @GetMapping("/mine")
    public List<ClaimResponse> mine() {
        return claimService.mine();
    }

    @GetMapping("/user/{userId}")
    public List<ClaimResponse> byUser(@PathVariable Long userId) {
        return claimService.byUser(userId);
    }

    @GetMapping("/{claimId}")
    public ClaimResponse get(@PathVariable Long claimId) {
        return claimService.get(claimId);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ClaimRequest request) {
        ClaimResponse claim = claimService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Claim submitted.", "claim", claim));
    }

    @PutMapping("/{claimId}/approve")
    public ClaimResponse approve(
            @PathVariable Long claimId,
            @Valid @RequestBody(required = false) ClaimReviewRequest request
    ) {
        return claimService.approve(claimId, request == null ? new ClaimReviewRequest() : request);
    }

    @PutMapping("/{claimId}/reject")
    public ClaimResponse reject(
            @PathVariable Long claimId,
            @Valid @RequestBody(required = false) ClaimReviewRequest request
    ) {
        return claimService.reject(claimId, request == null ? new ClaimReviewRequest() : request);
    }

    @DeleteMapping("/{claimId}")
    public ResponseEntity<Void> delete(@PathVariable Long claimId) {
        claimService.delete(claimId);
        return ResponseEntity.noContent().build();
    }
}
