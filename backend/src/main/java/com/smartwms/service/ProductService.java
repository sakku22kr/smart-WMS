package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ProductRequest;
import com.smartwms.dto.response.ProductResponse;

public interface ProductService {

    PageResponse<ProductResponse> getAllProducts(
            int page, int size, String sort, String direction,
            String search, String status, Long categoryId, Long supplierId, Long warehouseId);

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySku(String sku);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    void restoreProduct(Long id);

    ProductResponse activateProduct(Long id);

    ProductResponse deactivateProduct(Long id);

    boolean isSkuAvailable(String sku, Long excludeId);

    boolean isBarcodeAvailable(String barcode, Long excludeId);

    PageResponse<ProductResponse> getDeletedProducts(String search, int page, int size);

    // ─── Stock-related methods consumed by Inventory module ──────

    /**
     * Returns the current stock for a product.
     */
    int getCurrentStock(Long productId);

    /**
     * Returns the available stock (current - reserved) for a product.
     */
    int getAvailableStock(Long productId);

    /**
     * Returns the reserved stock for a product.
     */
    int getReservedStock(Long productId);

    /**
     * Returns the reorder level for a product.
     */
    int getReorderLevel(Long productId);

    /**
     * Checks if a product has sufficient available stock.
     */
    boolean hasSufficientStock(Long productId, int quantity);
}
