package com.smartwms.service;

import com.smartwms.constants.StockStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.InventorySummaryResponse;
import com.smartwms.dto.response.StockAdjustmentResponse;

/**
 * Service interface for product inventory operations.
 * This interface is consumed by the Inventory module to manage stock.
 */
public interface ProductInventoryService {

    /**
     * Adjusts stock for a product.
     *
     * @param productId      the product to adjust
     * @param quantityChange positive to add, negative to subtract
     * @param reason         reason for adjustment
     * @param performedBy    username of the user making the adjustment
     * @return the adjustment result
     */
    StockAdjustmentResponse adjustStock(Long productId, int quantityChange, String reason, String performedBy);

    /**
     * Reserves stock for a pending order.
     *
     * @param productId  the product to reserve
     * @param quantity   quantity to reserve
     * @param performedBy username
     * @return the adjustment result
     */
    StockAdjustmentResponse reserveStock(Long productId, int quantity, String performedBy);

    /**
     * Releases previously reserved stock.
     *
     * @param productId  the product to release
     * @param quantity   quantity to release
     * @param performedBy username
     * @return the adjustment result
     */
    StockAdjustmentResponse releaseReservedStock(Long productId, int quantity, String performedBy);

    /**
     * Confirms reserved stock as dispatched (reduces current stock).
     *
     * @param productId  the product
     * @param quantity   quantity dispatched
     * @param performedBy username
     * @return the adjustment result
     */
    StockAdjustmentResponse confirmDispatch(Long productId, int quantity, String performedBy);

    /**
     * Returns a paginated inventory summary for all products.
     */
    PageResponse<InventorySummaryResponse> getInventorySummary(
            int page, int size, String sort, String direction,
            Long warehouseId, StockStatus stockStatus);

    /**
     * Returns the inventory summary for a single product.
     */
    InventorySummaryResponse getProductInventory(Long productId);

    /**
     * Returns products with stock at or below reorder level.
     */
    java.util.List<InventorySummaryResponse> getLowStockProducts();

    /**
     * Returns products with zero or negative stock.
     */
    java.util.List<InventorySummaryResponse> getOutOfStockProducts();

    /**
     * Derives the stock status for a given stock level vs reorder level.
     */
    StockStatus calculateStockStatus(int currentStock, int reorderLevel);
}
