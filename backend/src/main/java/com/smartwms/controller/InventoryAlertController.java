package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.response.InventoryStatisticsResponse;
import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.service.InventoryAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for inventory alerts, stock monitoring, and statistics.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/inventory/alerts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory Alerts", description = "Low stock alerts, out of stock alerts, and inventory statistics")
public class InventoryAlertController {

    private final InventoryAlertService inventoryAlertService;

    @GetMapping("/low-stock")
    @Operation(summary = "Low Stock Products", description = "Returns products with stock at or below reorder level.")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getLowStockProducts() {
        log.info("GET /inventory/alerts/low-stock");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getLowStockProducts()));
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Out of Stock Products", description = "Returns products with zero or negative stock.")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getOutOfStockProducts() {
        log.info("GET /inventory/alerts/out-of-stock");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getOutOfStockProducts()));
    }

    @GetMapping("/reorder")
    @Operation(summary = "Reorder Alerts", description = "Returns all products requiring reorder (low + out of stock).")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getReorderAlerts() {
        log.info("GET /inventory/alerts/reorder");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getReorderAlerts()));
    }

    @GetMapping("/critical")
    @Operation(summary = "Critical Alerts", description = "Returns products with stock below 50% of reorder level.")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getCriticalAlerts() {
        log.info("GET /inventory/alerts/critical");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getCriticalAlerts()));
    }

    @GetMapping("/overstocked")
    @Operation(summary = "Overstocked Products", description = "Returns products with stock above 2x reorder level.")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getOverstockedProducts() {
        log.info("GET /inventory/alerts/overstocked");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getOverstockedProducts()));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Inventory Statistics", description = "Returns comprehensive inventory statistics and health metrics.")
    public ResponseEntity<ApiResponse<InventoryStatisticsResponse>> getInventoryStatistics() {
        log.info("GET /inventory/alerts/statistics");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getInventoryStatistics()));
    }

    @GetMapping("/health-score")
    @Operation(summary = "Stock Health Score", description = "Returns stock health score (0-100).")
    public ResponseEntity<ApiResponse<Integer>> getStockHealthScore() {
        log.info("GET /inventory/alerts/health-score");
        return ResponseEntity.ok(ApiResponse.success(inventoryAlertService.getStockHealthScore()));
    }
}
