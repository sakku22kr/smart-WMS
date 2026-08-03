package com.smartwms.dto.response;

import com.smartwms.constants.InventoryTransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response payload for an inventory transaction.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Inventory transaction response")
public class InventoryResponse {

    @Schema(description = "Transaction ID")
    private Long id;

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

    @Schema(description = "Transaction type", example = "STOCK_IN")
    private InventoryTransactionType transactionType;

    @Schema(description = "Quantity (positive for in, negative for out)", example = "50")
    private Integer quantity;

    @Schema(description = "Stock before this transaction", example = "100")
    private Integer quantityBefore;

    @Schema(description = "Stock after this transaction", example = "150")
    private Integer quantityAfter;

    @Schema(description = "Unit cost", example = "250.00")
    private BigDecimal unitCost;

    @Schema(description = "Total value (quantity * unitCost)", example = "12500.00")
    private BigDecimal totalValue;

    @Schema(description = "External reference number")
    private String referenceNumber;

    @Schema(description = "Reason for transaction")
    private String reason;

    @Schema(description = "Username of performer")
    private String performedBy;

    @Schema(description = "Transaction timestamp")
    private LocalDateTime transactionDate;

    @Schema(description = "For transfers: destination warehouse ID")
    private Long destinationWarehouseId;

    @Schema(description = "For transfers: destination warehouse name")
    private String destinationWarehouseName;

    @Schema(description = "Batch/lot number")
    private String batchNumber;

    @Schema(description = "Expiry date")
    private LocalDateTime expiryDate;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;
}
