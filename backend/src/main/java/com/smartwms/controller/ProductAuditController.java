package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ProductAuditResponse;
import com.smartwms.dto.response.ProductAuditStatsResponse;
import com.smartwms.service.ProductAuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_V1 + "/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Audit", description = "Audit trail endpoints for tracking product changes")
public class ProductAuditController {

    private final ProductAuditService productAuditService;

    @GetMapping("/{id}/audit-logs")
    @Operation(summary = "Get Product Audit Logs", description = "Returns paginated audit log entries for a specific product.")
    public ResponseEntity<ApiResponse<PageResponse<ProductAuditResponse>>> getAuditLogs(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @Parameter(description = "Filter by event type") @RequestParam(required = false) String eventType,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                productAuditService.getProductAuditLog(id, eventType, page, size)));
    }

    @GetMapping("/{id}/audit-logs/recent")
    @Operation(summary = "Get Recent Audit Logs", description = "Returns the 10 most recent audit log entries for a product.")
    public ResponseEntity<ApiResponse<PageResponse<ProductAuditResponse>>> getRecentAuditLogs(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                productAuditService.getProductAuditLog(id, null, 0, 10)));
    }

    @GetMapping("/{id}/audit-stats")
    @Operation(summary = "Get Product Audit Statistics", description = "Returns aggregated audit statistics for a product.")
    public ResponseEntity<ApiResponse<ProductAuditStatsResponse>> getAuditStats(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                productAuditService.getAuditStats(id)));
    }

    @GetMapping("/audit-logs/user/{performedBy}")
    @Operation(summary = "Get Audit Logs by User", description = "Returns audit log entries performed by a specific user across all products.")
    public ResponseEntity<ApiResponse<PageResponse<ProductAuditResponse>>> getAuditLogsByUser(
            @Parameter(description = "Username") @PathVariable String performedBy,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                productAuditService.getAuditLogByUser(performedBy, page, size)));
    }

    @GetMapping("/audit-logs/stats")
    @Operation(summary = "Get Global Audit Stats", description = "Returns total number of audit events across all products.")
    public ResponseEntity<ApiResponse<Long>> getGlobalAuditStats() {
        return ResponseEntity.ok(ApiResponse.success(
                productAuditService.countAllEvents()));
    }
}
