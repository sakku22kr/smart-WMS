package com.smartwms.repository;

import com.smartwms.constants.AuditEventType;
import com.smartwms.entity.ProductAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAuditRepository extends JpaRepository<ProductAudit, Long> {

    Page<ProductAudit> findByProductIdOrderByPerformedAtDesc(Long productId, Pageable pageable);

    Page<ProductAudit> findByProductIdAndEventTypeOrderByPerformedAtDesc(
            Long productId, AuditEventType eventType, Pageable pageable);

    Page<ProductAudit> findByPerformedByOrderByPerformedAtDesc(String performedBy, Pageable pageable);

    List<ProductAudit> findTop10ByProductIdOrderByPerformedAtDesc(Long productId);

    @Query("SELECT a.eventType, COUNT(a) FROM ProductAudit a WHERE a.product.id = :productId GROUP BY a.eventType")
    List<Object[]> countByEventTypeForProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(a) FROM ProductAudit a WHERE a.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(a) FROM ProductAudit a WHERE a.performedAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") java.time.LocalDateTime start,
                          @Param("end") java.time.LocalDateTime end);

    @Query("SELECT a.performedBy, COUNT(a) FROM ProductAudit a GROUP BY a.performedBy ORDER BY COUNT(a) DESC")
    List<Object[]> countByUser();
}
