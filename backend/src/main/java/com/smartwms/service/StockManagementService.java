package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.StockAdjustRequest;
import com.smartwms.dto.request.StockInRequest;
import com.smartwms.dto.request.StockOutRequest;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.dto.response.StockLevelResponse;

/**
 * Service layer for stock management operations.
 * Provides convenience methods over the raw InventoryTransaction system.
 */
public interface StockManagementService {

    /**
     * Receive stock into a warehouse.
     */
    InventoryResponse stockIn(StockInRequest request, String performedBy);

    /**
     * Dispatch stock from a warehouse.
     * Validates sufficient available stock.
     */
    InventoryResponse stockOut(StockOutRequest request, String performedBy);

    /**
     * Adjust stock to match a physical count.
     * Computes the difference and records an ADJUSTMENT transaction.
     */
    InventoryResponse adjustStock(StockAdjustRequest request, String performedBy);

    /**
     * Get stock level for a specific product in a specific warehouse.
     */
    StockLevelResponse getStockLevel(Long productId, Long warehouseId);

    /**
     * Get stock levels for a warehouse (all products).
     */
    PageResponse<StockLevelResponse> getStockLevelsByWarehouse(Long warehouseId, int page, int size);

    /**
     * Get stock levels for a product (all warehouses).
     */
    PageResponse<StockLevelResponse> getStockLevelsByProduct(Long productId, int page, int size);
}
