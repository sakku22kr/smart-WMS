package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * Response payload representing the stock level of a product in a warehouse.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Current stock level for a product in a warehouse")
public class StockLevelResponse {

    @Schema(description = "Product ID")
    private Long productId;

    @Schema(description = "Product name")
    private String productName;

    @Schema(description = "Product SKU")
    private String productSku;

    @Schema(description = "Warehouse ID")
    private Long warehouseId;

    @Schema(description = "Warehouse name")
    private String warehouseName;

    @Schema(description = "Current stock quantity", example = "150")
    private Integer currentStock;

    @Schema(description = "Reserved stock quantity", example = "20")
    private Integer reservedStock;

    @Schema(description = "Available stock (current - reserved)", example = "130")
    private Integer availableStock;

    @Schema(description = "Reorder level", example = "10")
    private Integer reorderLevel;

    @Schema(description = "Whether stock is low (current <= reorderLevel)", example = "false")
    private Boolean lowStock;

    @Schema(description = "Whether product is out of stock", example = "false")
    private Boolean outOfStock;

    @Schema(description = "Total stock in value", example = "37500.00")
    private java.math.BigDecimal totalValue;

    @Schema(description = "Total number of transactions for this product-warehouse")
    private Long transactionCount;
}
