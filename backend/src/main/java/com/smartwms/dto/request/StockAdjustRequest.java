package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request payload for adjusting stock to match a physical count.
 * The system calculates the difference and records an ADJUSTMENT transaction.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Stock Adjustment request — set stock to match physical count")
public class StockAdjustRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    @Schema(description = "Warehouse ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long warehouseId;

    @NotNull(message = "Actual count is required")
    @Min(value = 0, message = "Actual count cannot be negative")
    @Schema(description = "Actual physical count", requiredMode = Schema.RequiredMode.REQUIRED, example = "45")
    private Integer actualCount;

    @Size(max = 500, message = "Reason max 500 characters")
    @Schema(description = "Reason for this adjustment (e.g. cycle count, damage)", example = "Cycle count discrepancy")
    private String reason;
}
