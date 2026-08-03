package com.smartwms.dto.request;

import com.smartwms.constants.InventoryTransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request payload for creating an inventory transaction.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Inventory transaction request")
public class InventoryRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    @Schema(description = "Warehouse ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long warehouseId;

    @NotNull(message = "Transaction type is required")
    @Schema(description = "Transaction type", requiredMode = Schema.RequiredMode.REQUIRED)
    private InventoryTransactionType transactionType;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity (always positive; direction determined by type)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "Unit cost cannot be negative")
    @Schema(description = "Unit cost at time of transaction")
    private BigDecimal unitCost;

    @Size(max = 100, message = "Reference number max 100 characters")
    @Schema(description = "External reference number (PO, order, etc.)")
    private String referenceNumber;

    @Size(max = 500, message = "Reason max 500 characters")
    @Schema(description = "Reason for this transaction")
    private String reason;

    @Schema(description = "For transfers: destination warehouse ID")
    private Long destinationWarehouseId;

    @Size(max = 100, message = "Batch number max 100 characters")
    @Schema(description = "Batch/lot number for traceability")
    private String batchNumber;

    @Schema(description = "Expiry date for perishable items")
    private LocalDateTime expiryDate;
}
