package com.smartwms.service;

import com.smartwms.dto.response.InventoryStatisticsResponse;
import com.smartwms.dto.response.LowStockProductResponse;

import java.util.List;

/**
 * Service for inventory alerts, stock monitoring, and statistics.
 * Provides methods for low stock alerts, out of stock alerts, and inventory health metrics.
 */
public interface InventoryAlertService {

    /**
     * Returns products with stock at or below the reorder level.
     */
    List<LowStockProductResponse> getLowStockProducts();

    /**
     * Returns products with zero or negative stock.
     */
    List<LowStockProductResponse> getOutOfStockProducts();

    /**
     * Returns products requiring immediate reorder (low or out of stock).
     */
    List<LowStockProductResponse> getReorderAlerts();

    /**
     * Returns comprehensive inventory statistics and health metrics.
     */
    InventoryStatisticsResponse getInventoryStatistics();

    /**
     * Returns stock health score (0-100) based on product distribution.
     */
    Integer getStockHealthScore();

    /**
     * Returns products with stock above 2x reorder level (overstocked).
     */
    List<LowStockProductResponse> getOverstockedProducts();

    /**
     * Returns critical alerts: products with stock below 50% of reorder level.
     */
    List<LowStockProductResponse> getCriticalAlerts();
}
