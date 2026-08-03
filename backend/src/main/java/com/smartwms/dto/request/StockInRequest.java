package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request payload for receiving stock into a warehouse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Stock In request — receive goods into warehouse")
public class StockInRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    @Schema(description = "Warehouse ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long warehouseId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity to receive", requiredMode = Schema.RequiredMode.REQUIRED, example = "50")
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "Unit cost cannot be negative")
    @Schema(description = "Unit cost of received goods", example = "250.00")
    private BigDecimal unitCost;

    @Size(max = 100, message = "Reference number max 100 characters")
    @Schema(description = "Purchase order / delivery reference", example = "PO-2024-001")
    private String referenceNumber;

    @Size(max = 100, message = "Batch number max 100 characters")
    @Schema(description = "Batch/lot number for traceability", example = "LOT-2024-A")
    private String batchNumber;

    @Size(max = 500, message = "Reason max 500 characters")
    @Schema(description = "Reason for this stock receipt")
    private String reason;
}
