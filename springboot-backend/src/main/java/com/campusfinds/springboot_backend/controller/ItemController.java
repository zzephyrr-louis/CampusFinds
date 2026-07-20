package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.dto.ItemRequest;
import com.campusfinds.springboot_backend.dto.ItemResponse;
import com.campusfinds.springboot_backend.dto.ItemStatusRequest;
import com.campusfinds.springboot_backend.model.ReportType;
import com.campusfinds.springboot_backend.service.ItemService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemResponse> search(
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false, name = "type") String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) {
        return itemService.search(query, type, category, status, days, sort);
    }

    @GetMapping("/lost")
    public List<ItemResponse> lost() {
        return itemService.byType(ReportType.LOST);
    }

    @GetMapping("/found")
    public List<ItemResponse> found() {
        return itemService.byType(ReportType.FOUND);
    }

    @GetMapping("/claimable")
    public List<ItemResponse> claimable() {
        return itemService.claimable();
    }

    @GetMapping("/{itemId}")
    public ItemResponse get(@PathVariable Long itemId) {
        return itemService.get(itemId);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ItemRequest request) {
        ItemResponse item = itemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Item report created.", "item", item));
    }

    @PostMapping("/lost")
    public ResponseEntity<Map<String, Object>> createLost(@Valid @RequestBody ItemRequest request) {
        request.setReportType(ReportType.LOST);
        return createdAlias(itemService.create(request));
    }

    @PostMapping("/found")
    public ResponseEntity<Map<String, Object>> createFound(@Valid @RequestBody ItemRequest request) {
        request.setReportType(ReportType.FOUND);
        return createdAlias(itemService.create(request));
    }

    @PutMapping("/{itemId}")
    public ItemResponse update(@PathVariable Long itemId, @Valid @RequestBody ItemRequest request) {
        return itemService.update(itemId, request);
    }

    @PutMapping("/{itemId}/status")
    public ItemResponse updateStatus(
            @PathVariable Long itemId,
            @Valid @RequestBody ItemStatusRequest request
    ) {
        return itemService.updateStatus(itemId, request.getStatus());
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(@PathVariable Long itemId) {
        itemService.delete(itemId);
        return ResponseEntity.noContent().build();
    }

    private static ResponseEntity<Map<String, Object>> createdAlias(ItemResponse item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Item report created.", "item", item));
    }
}
