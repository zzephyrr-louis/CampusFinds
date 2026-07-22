package com.campusfinds.springboot_backend.repository;

import com.campusfinds.springboot_backend.model.Item;
import com.campusfinds.springboot_backend.model.ItemStatus;
import com.campusfinds.springboot_backend.model.ReportType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @EntityGraph(attributePaths = {"reporter", "relatedItem"})
    List<Item> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"reporter", "relatedItem"})
    List<Item> findByReportTypeOrderByCreatedAtDesc(ReportType reportType);

    @EntityGraph(attributePaths = {"reporter", "relatedItem"})
    List<Item> findByReportTypeAndStatusInOrderByCreatedAtDesc(
            ReportType reportType, Collection<ItemStatus> statuses);

    @EntityGraph(attributePaths = {"reporter", "relatedItem"})
    List<Item> findTop5ByOrderByCreatedAtDesc();

    long countByReportType(ReportType reportType);

    boolean existsByReporterUserId(Long userId);

    boolean existsByRelatedItemItemId(Long itemId);

    boolean existsByImageUrlAndItemIdNot(String imageUrl, Long itemId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from Item item where item.itemId = :itemId")
    Optional<Item> findByIdForUpdate(@Param("itemId") Long itemId);

    @Modifying
    @Query("update Item item set item.relatedItem = null where item.relatedItem.itemId = :itemId")
    int clearRelatedItemReferences(@Param("itemId") Long itemId);
}
