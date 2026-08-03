package com.smartwms.dto.response;

import com.smartwms.constants.ProductStatus;
import com.smartwms.constants.StockStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product response payload")
public class ProductResponse {

    @Schema(description = "Unique product identifier", example = "1")
    private Long id;

    @Schema(description = "Product name", example = "Wireless Headset Pro X200")
    private String name;

    @Schema(description = "Stock Keeping Unit", example = "WH-X200")
    private String sku;

    @Schema(description = "Product barcode", example = "8901234567890")
    private String barcode;

    @Schema(description = "Product description")
    private String description;

    @Schema(description = "Product brand", example = "AudioTech")
    private String brand;

    @Schema(description = "Product model", example = "AT-WH200")
    private String model;

    @Schema(description = "Unit of measure", example = "PCS")
    private String unit;

    @Schema(description = "Purchase price", example = "2500.00")
    private BigDecimal purchasePrice;

    @Schema(description = "Selling price", example = "4999.00")
    private BigDecimal sellingPrice;

    @Schema(description = "Tax rate percentage", example = "18.0")
    private BigDecimal taxRate;

    @Schema(description = "Reorder level threshold", example = "10")
    private Integer reorderLevel;

    @Schema(description = "Default reorder quantity", example = "50")
    private Integer reorderQuantity;

    @Schema(description = "Current stock quantity", example = "142")
    private Integer currentStock;

    @Schema(description = "Reserved stock quantity", example = "5")
    private Integer reservedStock;

    @Schema(description = "Available stock (current - reserved)", example = "137")
    private Integer availableStock;

    @Schema(description = "Stock status: IN_STOCK, LOW_STOCK, OUT_OF_STOCK, OVERSTOCKED", example = "IN_STOCK")
    private StockStatus stockStatus;

    @Schema(description = "Product image URL")
    private String imageUrl;

    @Schema(description = "Product status", example = "ACTIVE")
    private ProductStatus status;

    @Schema(description = "Low stock flag", example = "false")
    private boolean lowStock;

    @Schema(description = "Out of stock flag", example = "false")
    private boolean outOfStock;

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Category name", example = "Electronics")
    private String categoryName;

    @Schema(description = "Supplier ID", example = "1")
    private Long supplierId;

    @Schema(description = "Supplier name", example = "Tech Supplies Inc.")
    private String supplierName;

    @Schema(description = "Supplier email", example = "contact@supplier.com")
    private String supplierEmail;

    @Schema(description = "Supplier phone", example = "+91-98201-12345")
    private String supplierPhone;

    @Schema(description = "Warehouse ID", example = "1")
    private Long warehouseId;

    @Schema(description = "Warehouse name", example = "Main Warehouse")
    private String warehouseName;

    @Schema(description = "Warehouse location", example = "Mumbai, India")
    private String warehouseLocation;

    @Schema(description = "Additional notes")
    private String notes;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "User who created this record")
    private String createdBy;
}
