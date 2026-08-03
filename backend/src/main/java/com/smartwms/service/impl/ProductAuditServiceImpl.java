package com.smartwms.service.impl;

import com.smartwms.constants.AuditEventType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ProductAuditResponse;
import com.smartwms.dto.response.ProductAuditStatsResponse;
import com.smartwms.entity.Product;
import com.smartwms.entity.ProductAudit;
import com.smartwms.repository.ProductAuditRepository;
import com.smartwms.service.ProductAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductAuditServiceImpl implements ProductAuditService {

    private final ProductAuditRepository auditRepository;

    @Override
    public void logEvent(Product product, AuditEventType eventType, String performedBy,
                         String description, String oldValue, String newValue) {
        ProductAudit audit = new ProductAudit();
        audit.setProduct(product);
        audit.setEventType(eventType);
        audit.setPerformedBy(performedBy != null ? performedBy : "system");
        audit.setDescription(description);
        audit.setOldValue(oldValue);
        audit.setNewValue(newValue);
        auditRepository.save(audit);
        log.debug("Audit logged: {} for product {} by {}", eventType, product.getSku(), performedBy);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductAuditResponse> getProductAuditLog(Long productId, String eventType,
                                                                 int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by("performedAt").descending());

        Page<ProductAudit> auditPage;

        if (eventType != null && !eventType.isBlank()) {
            try {
                AuditEventType type = AuditEventType.valueOf(eventType.trim().toUpperCase());
                auditPage = auditRepository.findByProductIdAndEventTypeOrderByPerformedAtDesc(
                        productId, type, pageable);
            } catch (IllegalArgumentException e) {
                auditPage = auditRepository.findByProductIdOrderByPerformedAtDesc(productId, pageable);
            }
        } else {
            auditPage = auditRepository.findByProductIdOrderByPerformedAtDesc(productId, pageable);
        }

        Page<ProductAuditResponse> responsePage = auditPage.map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductAuditResponse> getAuditLogByUser(String performedBy, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by("performedAt").descending());

        Page<ProductAudit> auditPage = auditRepository.findByPerformedByOrderByPerformedAtDesc(
                performedBy, pageable);

        Page<ProductAuditResponse> responsePage = auditPage.map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductAuditStatsResponse getAuditStats(Long productId) {
        long totalEvents = auditRepository.countByProductId(productId);
        List<Object[]> counts = auditRepository.countByEventTypeForProduct(productId);

        List<ProductAuditStatsResponse.EventTypeCount> eventCounts = new ArrayList<>();

        for (Object[] row : counts) {
            eventCounts.add(new ProductAuditStatsResponse.EventTypeCount(
                    row[0].toString(), (Long) row[1]));
        }

        String lastActivityAt = null;
        String lastPerformedBy = null;
        var recentAudits = auditRepository.findTop10ByProductIdOrderByPerformedAtDesc(productId);
        if (!recentAudits.isEmpty()) {
            lastActivityAt = recentAudits.get(0).getPerformedAt().toString();
            lastPerformedBy = recentAudits.get(0).getPerformedBy();
        }

        return ProductAuditStatsResponse.builder()
                .totalEvents(totalEvents)
                .eventsByType(eventCounts)
                .lastActivityAt(lastActivityAt)
                .lastPerformedBy(lastPerformedBy)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countAllEvents() {
        return auditRepository.count();
    }

    private ProductAuditResponse toResponse(ProductAudit audit) {
        return ProductAuditResponse.builder()
                .id(audit.getId())
                .productId(audit.getProduct().getId())
                .productName(audit.getProduct().getName())
                .productSku(audit.getProduct().getSku())
                .eventType(audit.getEventType())
                .performedBy(audit.getPerformedBy())
                .performedAt(audit.getPerformedAt())
                .description(audit.getDescription())
                .oldValue(audit.getOldValue())
                .newValue(audit.getNewValue())
                .ipAddress(audit.getIpAddress())
                .build();
    }
}
