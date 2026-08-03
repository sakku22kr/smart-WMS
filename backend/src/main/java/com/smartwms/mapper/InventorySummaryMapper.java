package com.smartwms.mapper;

import com.smartwms.dto.response.InventorySummaryResponse;
import com.smartwms.entity.Product;
import com.smartwms.service.ProductInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * MapStruct-compatible mapper for Product → InventorySummaryResponse.
 * Uses Spring component model so @Autowired injection works for stock status calculation.
 */
@Component
public class InventorySummaryMapper {

    @Autowired
    private ProductInventoryService productInventoryService;

    public InventorySummaryResponse toResponse(Product product) {
        if (product == null) return null;

        int currentStock = product.getCurrentStock();
        int reorderLevel = product.getReorderLevel();

        return InventorySummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .brand(product.getBrand())
                .unit(product.getUnit())
                .sellingPrice(product.getSellingPrice())
                .currentStock(currentStock)
                .reservedStock(product.getReservedStock())
                .availableStock(product.getAvailableStock())
                .reorderLevel(reorderLevel)
                .reorderQuantity(product.getReorderQuantity())
                .stockStatus(productInventoryService.calculateStockStatus(currentStock, reorderLevel))
                .status(product.getStatus())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .warehouseId(product.getWarehouse() != null ? product.getWarehouse().getId() : null)
                .warehouseName(product.getWarehouse() != null ? product.getWarehouse().getName() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .lowStock(product.isLowStock())
                .outOfStock(product.isOutOfStock())
                .build();
    }
}
