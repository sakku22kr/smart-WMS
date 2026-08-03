package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response returned after a stock adjustment operation.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Stock adjustment result")
public class StockAdjustmentResponse {

    @Schema(description = "Product ID")
    private Long productId;

    @Schema(description = "Product SKU")
    private String sku;

    @Schema(description = "Previous stock quantity")
    private Integer previousStock;

    @Schema(description = "New stock quantity")
    private Integer newStock;

    @Schema(description = "Quantity changed", example = "+10")
    private Integer quantityChanged;

    @Schema(description = "Reason for adjustment", example = "PURCHASE_RECEIPT")
    private String reason;

    @Schema(description = "Adjustment timestamp")
    private LocalDateTime adjustedAt;

    @Schema(description = "Adjusted by user")
    private String adjustedBy;
}
