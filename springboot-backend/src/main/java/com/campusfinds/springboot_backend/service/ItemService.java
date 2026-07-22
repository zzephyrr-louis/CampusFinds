package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.ItemRequest;
import com.campusfinds.springboot_backend.dto.ItemResponse;
import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.Item;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.campusfinds.springboot_backend.model.NotificationType;
import com.campusfinds.springboot_backend.model.ReportType;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.ItemClaimRepository;
import com.campusfinds.springboot_backend.repository.ItemRepository;
import com.campusfinds.springboot_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class ItemService {

    private static final Logger LOGGER = Logger.getLogger(ItemService.class.getName());

    private final ItemRepository itemRepository;
    private final ItemClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final ActivityLogService activityLogService;

    public ItemService(
            ItemRepository itemRepository,
            ItemClaimRepository claimRepository,
            NotificationRepository notificationRepository,
            CurrentUserService currentUserService,
            NotificationService notificationService,
            FileStorageService fileStorageService,
            ActivityLogService activityLogService
    ) {
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.notificationRepository = notificationRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> search(
            String query,
            String typeValue,
            String category,
            String statusValue,
            Integer days,
            String sort
    ) {
        ReportType type = parseReportType(typeValue);
        ItemStatus status = parseItemStatus(statusValue);
        String normalizedQuery = normalize(query);
        String normalizedCategory = category != null && category.equalsIgnoreCase("all")
                ? "" : normalize(category);
        Instant cutoff = days == null ? null : Instant.now().minus(validateDays(days), ChronoUnit.DAYS);

        List<Item> items = new ArrayList<>(itemRepository.findAllByOrderByCreatedAtDesc());
        items.removeIf(item -> type != null && item.getReportType() != type);
        items.removeIf(item -> status != null && item.getStatus() != status);
        items.removeIf(item -> !normalizedCategory.isEmpty()
                && !item.getCategory().toLowerCase(Locale.ROOT).equals(normalizedCategory));
        items.removeIf(item -> cutoff != null && item.getCreatedAt().isBefore(cutoff));
        items.removeIf(item -> !normalizedQuery.isEmpty() && !matches(item, normalizedQuery));

        if (sort != null && sort.equalsIgnoreCase("oldest")) {
            items.sort(Comparator.comparing(Item::getCreatedAt));
        } else if (sort != null && !sort.isBlank() && !sort.equalsIgnoreCase("newest")) {
            throw new ApiExceptions.BadRequestException("Sort must be newest or oldest.");
        }

        return items.stream().map(ItemResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> byType(ReportType type) {
        return itemRepository.findByReportTypeOrderByCreatedAtDesc(type).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> claimable() {
        return itemRepository.findByReportTypeAndStatusInOrderByCreatedAtDesc(
                        ReportType.FOUND,
                        List.of(ItemStatus.UNCLAIMED, ItemStatus.POSSIBLE_MATCH)).stream()
                .map(ItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse get(Long itemId) {
        return ItemResponse.from(requireItem(itemId));
    }

    @Transactional
    public ItemResponse create(ItemRequest request) {
        User reporter = currentUserService.requireCurrentUser();
        Item item = new Item();
        item.setReporter(reporter);
        applyRequest(item, request, true);
        item.setStatus(request.getReportType() == ReportType.LOST
                ? ItemStatus.OPEN : ItemStatus.UNCLAIMED);

        Item saved = itemRepository.save(item);
        activityLogService.record(reporter, "ITEM_CREATED",
                reporter.getFullname() + " reported " + saved.getItemName() + " as " + saved.getReportType() + ".");

        if (saved.getRelatedItem() != null) {
            Item related = saved.getRelatedItem();
            if (related.getStatus() == ItemStatus.OPEN) {
                related.setStatus(ItemStatus.POSSIBLE_MATCH);
            }
            if (!related.getReporter().getUserId().equals(reporter.getUserId())) {
                notificationService.create(
                        related.getReporter(),
                        NotificationType.MATCH,
                        "Possible match found",
                        matchNotificationMessage(saved.getItemName()),
                        related.getItemId(),
                        null);
            }
        }
        return ItemResponse.from(saved);
    }

    @Transactional
    public ItemResponse update(Long itemId, ItemRequest request) {
        User actor = currentUserService.requireCurrentUser();
        Item item = requireItem(itemId);
        requireOwnerOrAdmin(item, actor);
        if (item.getReportType() != request.getReportType()) {
            throw new ApiExceptions.BadRequestException("An item's report type cannot be changed.");
        }
        if (item.getStatus() == ItemStatus.CLAIMED || item.getStatus() == ItemStatus.RESOLVED) {
            if (!isAdmin(actor)) {
                throw new ApiExceptions.ConflictException("Resolved or claimed items can only be edited by an administrator.");
            }
        }

        applyRequest(item, request, false);
        Item saved = itemRepository.save(item);
        activityLogService.record(actor, "ITEM_UPDATED",
                actor.getFullname() + " updated item #" + itemId + ".");
        return ItemResponse.from(saved);
    }

    @Transactional
    public ItemResponse updateStatus(Long itemId, ItemStatus status) {
        User actor = currentUserService.requireCurrentUser();
        Item item = requireItem(itemId);
        requireOwnerOrAdmin(item, actor);
        validateStatusForType(item.getReportType(), status);
        item.setStatus(status);
        Item saved = itemRepository.save(item);
        activityLogService.record(actor, "ITEM_STATUS_UPDATED",
                actor.getFullname() + " set item #" + itemId + " to " + status + ".");
        return ItemResponse.from(saved);
    }

    @Transactional
    public void delete(Long itemId) {
        User actor = currentUserService.requireCurrentUser();
        Item item = requireItem(itemId);
        requireOwnerOrAdmin(item, actor);
        String itemName = item.getItemName();
        String imageUrl = item.getImageUrl();
        Item relatedLostItem = item.getRelatedItem();

        notificationRepository.deleteByItemId(itemId);
        if (relatedLostItem != null) {
            notificationRepository.deleteByTypeAndItemIdAndMessage(
                    NotificationType.MATCH,
                    relatedLostItem.getItemId(),
                    matchNotificationMessage(itemName));
        }
        claimRepository.deleteByItemItemId(itemId);
        itemRepository.clearRelatedItemReferences(itemId);
        itemRepository.delete(item);
        itemRepository.flush();

        if (relatedLostItem != null
                && relatedLostItem.getStatus() == ItemStatus.POSSIBLE_MATCH
                && !itemRepository.existsByRelatedItemItemId(relatedLostItem.getItemId())) {
            relatedLostItem.setStatus(ItemStatus.OPEN);
            notificationRepository.deleteByTypeAndItemId(
                    NotificationType.MATCH, relatedLostItem.getItemId());
        }

        activityLogService.record(actor, "ITEM_DELETED",
                actor.getFullname() + " deleted item #" + itemId + " (" + itemName + ").");

        if (imageUrl != null
                && !itemRepository.existsByImageUrlAndItemIdNot(imageUrl, itemId)) {
            deleteItemImageAfterCommit(imageUrl);
        }
    }

    private void deleteItemImageAfterCommit(String imageUrl) {
        Runnable deletion = () -> {
            try {
                fileStorageService.deleteItemImage(imageUrl);
            } catch (RuntimeException ex) {
                LOGGER.log(Level.WARNING, "Failed to delete item image " + imageUrl + ".", ex);
            }
        };

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deletion.run();
                }
            });
        } else {
            deletion.run();
        }
    }

    private static String matchNotificationMessage(String itemName) {
        return "A found report for \"" + itemName + "\" was linked to your lost report.";
    }

    private void applyRequest(Item item, ItemRequest request, boolean creating) {
        if (request.getReportType() == null) {
            throw new ApiExceptions.BadRequestException("Report type is required.");
        }
        validateFoundFields(request);
        validateImageUrl(request.getImageUrl());
        item.setItemName(request.getItemName().trim());
        item.setCategory(request.getCategory().trim());
        item.setDescription(request.getDescription().trim());
        item.setIdentifyingFeatures(trimToNull(request.getIdentifyingFeatures()));
        item.setLocation(request.getLocation().trim());
        item.setEventDate(request.getEventDate());
        item.setReportType(request.getReportType());
        item.setImageUrl(trimToNull(request.getImageUrl()));

        if (request.getReportType() == ReportType.FOUND) {
            item.setCondition(request.getCondition().trim());
            item.setStorageLocation(request.getStorageLocation().trim());
        } else {
            item.setCondition(null);
            item.setStorageLocation(null);
        }

        if (request.getRelatedItemId() == null) {
            item.setRelatedItem(null);
        } else {
            if (request.getReportType() != ReportType.FOUND) {
                throw new ApiExceptions.BadRequestException("Only found reports can link to a lost report.");
            }
            if (!creating && request.getRelatedItemId().equals(item.getItemId())) {
                throw new ApiExceptions.BadRequestException("An item cannot be related to itself.");
            }
            Item related = requireItem(request.getRelatedItemId());
            if (related.getReportType() != ReportType.LOST) {
                throw new ApiExceptions.BadRequestException("Related item must be a lost report.");
            }
            item.setRelatedItem(related);
        }
    }

    private Item requireItem(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("Item not found."));
    }

    private static void validateFoundFields(ItemRequest request) {
        if (request.getReportType() == ReportType.FOUND) {
            if (request.getCondition() == null || request.getCondition().isBlank()) {
                throw new ApiExceptions.BadRequestException("Condition is required for a found item.");
            }
            if (request.getStorageLocation() == null || request.getStorageLocation().isBlank()) {
                throw new ApiExceptions.BadRequestException("Storage location is required for a found item.");
            }
        }
    }

    private static void validateImageUrl(String imageUrl) {
        if (imageUrl != null && !imageUrl.isBlank() && !imageUrl.startsWith("/uploads/item-images/")) {
            throw new ApiExceptions.BadRequestException("Upload item images before submitting the report.");
        }
    }

    private static void validateStatusForType(ReportType type, ItemStatus status) {
        if (type == ReportType.LOST && (status == ItemStatus.UNCLAIMED || status == ItemStatus.CLAIMED)) {
            throw new ApiExceptions.BadRequestException("That status is not valid for a lost report.");
        }
        if (type == ReportType.FOUND && status == ItemStatus.OPEN) {
            throw new ApiExceptions.BadRequestException("OPEN is not valid for a found report.");
        }
    }

    private static void requireOwnerOrAdmin(Item item, User actor) {
        if (!item.getReporter().getUserId().equals(actor.getUserId()) && !isAdmin(actor)) {
            throw new ApiExceptions.ForbiddenOperationException("Only the reporter or an administrator can modify this item.");
        }
    }

    private static boolean isAdmin(User user) {
        return "admin".equalsIgnoreCase(user.getRole());
    }

    private static boolean matches(Item item, String query) {
        return normalize(item.getItemName()).contains(query)
                || normalize(item.getCategory()).contains(query)
                || normalize(item.getLocation()).contains(query)
                || normalize(item.getDescription()).contains(query);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static long validateDays(Integer days) {
        if (days < 1 || days > 3650) {
            throw new ApiExceptions.BadRequestException("Days must be between 1 and 3650.");
        }
        return days.longValue();
    }

    private static ReportType parseReportType(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("all")) return null;
        try {
            return ReportType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiExceptions.BadRequestException("Report type must be LOST or FOUND.");
        }
    }

    private static ItemStatus parseItemStatus(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("all")) return null;
        try {
            return ItemStatus.valueOf(value.trim().toUpperCase(Locale.ROOT).replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            throw new ApiExceptions.BadRequestException("Invalid item status.");
        }
    }
}
