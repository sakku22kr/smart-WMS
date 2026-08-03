package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request payload for dispatching stock from a warehouse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Stock Out request — dispatch/dispense goods from warehouse")
public class StockOutRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    @Schema(description = "Warehouse ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long warehouseId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity to dispatch", requiredMode = Schema.RequiredMode.REQUIRED, example = "10")
    private Integer quantity;

    @Size(max = 100, message = "Reference number max 100 characters")
    @Schema(description = "Order / shipment reference", example = "ORD-2024-042")
    private String referenceNumber;

    @Size(max = 500, message = "Reason max 500 characters")
    @Schema(description = "Reason for this stock dispatch")
    private String reason;
}
