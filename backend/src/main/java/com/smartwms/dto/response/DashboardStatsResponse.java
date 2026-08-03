package com.smartwms.dto.response;

import lombok.*;

/**
 * Aggregated KPI statistics returned by the Dashboard endpoint.
 *
 * <p>All counts are computed server-side from the current state of the
 * database. Trend/delta values are left to Phase 5 (historical data).</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // ─── Product Metrics ──────────────────────────────────────
    private long totalProducts;
    private long activeProducts;
    private long inactiveProducts;
    private long discontinuedProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private long totalCurrentStock;

    // ─── Category Metrics ─────────────────────────────────────
    private long totalCategories;
    private long activeCategories;
    private long inactiveCategories;
    private long rootCategories;
    private long maxCategoryDepth;
    private long avgProductsPerCategory;

    // ─── Supplier Metrics ─────────────────────────────────────
    private long totalSuppliers;
    private long activeSuppliers;

    // ─── Warehouse Metrics ────────────────────────────────────
    private long totalWarehouses;
    private long activeWarehouses;
    private long inactiveWarehouses;
    private long maintenanceWarehouses;
    private Double totalWarehouseCapacity;
    private Double totalWarehouseUtilized;
    private Double warehouseUtilizationPercent;
    private long warehousesNearCapacity;
    private long warehousesFull;

    // ─── Inventory Value Metrics ──────────────────────────────
    private java.math.BigDecimal totalInventoryValue;
    private java.math.BigDecimal averageSellingPrice;

    // ─── Purchase Order Metrics ───────────────────────────────
    private long totalOrders;
    private long pendingOrders;
    private long approvedOrders;
    private long rejectedOrders;
    private long completedOrders;
    private long cancelledOrders;
    private java.math.BigDecimal totalOrderValue;
    private java.math.BigDecimal pendingOrderValue;
}
