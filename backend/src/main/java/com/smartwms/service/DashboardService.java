package com.smartwms.service;

import com.smartwms.dto.response.DashboardPurchaseOrderResponse;
import com.smartwms.dto.response.DashboardStatsResponse;
import com.smartwms.dto.response.InventoryValueResponse;
import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.dto.response.ProductStatisticsResponse;
import com.smartwms.dto.response.TopProductResponse;

import java.util.List;

/**
 * Service contract for dashboard aggregations and KPI metrics.
 */
public interface DashboardService {

    /**
     * Returns aggregated KPI counts for the main dashboard.
     */
    DashboardStatsResponse getStats();

    /**
     * Returns products whose current stock is at or below the reorder level.
     */
    List<LowStockProductResponse> getLowStockProducts();

    /**
     * Returns products that are completely out of stock.
     */
    List<LowStockProductResponse> getOutOfStockProducts();

    /**
     * Returns top products by stock quantity.
     */
    List<TopProductResponse> getTopProducts(int limit);

    /**
     * Returns detailed product statistics.
     */
    ProductStatisticsResponse getProductStatistics();

    /**
     * Returns inventory value breakdown by category.
     */
    InventoryValueResponse getInventoryValue();

    /**
     * Returns recent purchase orders for dashboard display.
     */
    List<DashboardPurchaseOrderResponse> getRecentOrders(int limit);
}
