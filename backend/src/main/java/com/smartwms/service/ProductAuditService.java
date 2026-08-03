package com.smartwms.service;

import com.smartwms.constants.AuditEventType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ProductAuditResponse;
import com.smartwms.dto.response.ProductAuditStatsResponse;
import com.smartwms.entity.Product;

public interface ProductAuditService {

    void logEvent(Product product, AuditEventType eventType, String performedBy,
                  String description, String oldValue, String newValue);

    PageResponse<ProductAuditResponse> getProductAuditLog(Long productId, String eventType,
                                                          int page, int size);

    PageResponse<ProductAuditResponse> getAuditLogByUser(String performedBy, int page, int size);

    ProductAuditStatsResponse getAuditStats(Long productId);

    long countAllEvents();
}
