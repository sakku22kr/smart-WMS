package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.response.DashboardPurchaseOrderResponse;
import com.smartwms.dto.response.DashboardStatsResponse;
import com.smartwms.dto.response.InventoryValueResponse;
import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.dto.response.ProductStatisticsResponse;
import com.smartwms.dto.response.TopProductResponse;
import com.smartwms.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for dashboard KPI metrics and alert data.
 *
 * <p>All endpoints under {@code /api/v1/dashboard} require authentication.</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard KPI statistics and alert endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    // ─── KPI Stats ────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(
        summary     = "Get Dashboard KPI Stats",
        description = "Returns aggregated counts for products, categories, suppliers, and warehouses."
    )
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        log.debug("GET /dashboard/stats");
        DashboardStatsResponse stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ─── Inventory Alerts ─────────────────────────────────────

    @GetMapping("/low-stock")
    @Operation(
        summary     = "Get Low-Stock Products",
        description = "Returns products whose current stock is at or below the reorder level."
    )
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getLowStock() {
        log.debug("GET /dashboard/low-stock");
        List<LowStockProductResponse> items = dashboardService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/out-of-stock")
    @Operation(
        summary     = "Get Out-of-Stock Products",
        description = "Returns products with zero or negative current stock."
    )
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getOutOfStock() {
        log.debug("GET /dashboard/out-of-stock");
        List<LowStockProductResponse> items = dashboardService.getOutOfStockProducts();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    // ─── Top Products ────────────────────────────────────────

    @GetMapping("/top-products")
    @Operation(
        summary     = "Get Top Products",
        description = "Returns top products by stock quantity."
    )
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopProducts(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "6") int limit) {
        log.debug("GET /dashboard/top-products — limit={}", limit);
        List<TopProductResponse> items = dashboardService.getTopProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    // ─── Product Statistics ──────────────────────────────────

    @GetMapping("/product-statistics")
    @Operation(
        summary     = "Get Product Statistics",
        description = "Returns detailed product statistics including stock distribution and category breakdown."
    )
    public ResponseEntity<ApiResponse<ProductStatisticsResponse>> getProductStatistics() {
        log.debug("GET /dashboard/product-statistics");
        ProductStatisticsResponse stats = dashboardService.getProductStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ─── Inventory Value ─────────────────────────────────────

    @GetMapping("/inventory-value")
    @Operation(
        summary     = "Get Inventory Value",
        description = "Returns inventory value breakdown by category."
    )
    public ResponseEntity<ApiResponse<InventoryValueResponse>> getInventoryValue() {
        log.debug("GET /dashboard/inventory-value");
        InventoryValueResponse value = dashboardService.getInventoryValue();
        return ResponseEntity.ok(ApiResponse.success(value));
    }

    // ─── Recent Purchase Orders ──────────────────────────────

    @GetMapping("/recent-orders")
    @Operation(
        summary     = "Get Recent Purchase Orders",
        description = "Returns recent purchase orders for dashboard display."
    )
    public ResponseEntity<ApiResponse<List<DashboardPurchaseOrderResponse>>> getRecentOrders(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "5") int limit) {
        log.debug("GET /dashboard/recent-orders — limit={}", limit);
        List<DashboardPurchaseOrderResponse> orders = dashboardService.getRecentOrders(limit);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
