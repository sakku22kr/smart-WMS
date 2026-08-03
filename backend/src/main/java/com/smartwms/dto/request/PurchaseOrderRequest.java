package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request payload for creating a purchase order.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Purchase order request")
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    @Schema(description = "Supplier ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long supplierId;

    @NotNull(message = "Warehouse ID is required")
    @Schema(description = "Warehouse ID for receiving", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long warehouseId;

    @Schema(description = "Order date (defaults to today)")
    private LocalDate orderDate;

    @Schema(description = "Expected delivery date")
    private LocalDate expectedDeliveryDate;

    @DecimalMin(value = "0.0", message = "Tax amount cannot be negative")
    @Schema(description = "Tax amount")
    private BigDecimal taxAmount;

    @DecimalMin(value = "0.0", message = "Shipping cost cannot be negative")
    @Schema(description = "Shipping cost")
    private BigDecimal shippingCost;

    @DecimalMin(value = "0.0", message = "Discount amount cannot be negative")
    @Schema(description = "Discount amount")
    private BigDecimal discountAmount;

    @Size(max = 10, message = "Currency max 10 characters")
    @Schema(description = "Currency code", example = "INR")
    private String currency;

    @Size(max = 200, message = "Payment terms max 200 characters")
    @Schema(description = "Payment terms")
    private String paymentTerms;

    @Size(max = 500, message = "Shipping address max 500 characters")
    @Schema(description = "Shipping address")
    private String shippingAddress;

    @Size(max = 1000, message = "Notes max 1000 characters")
    @Schema(description = "External notes (visible on PO)")
    private String notes;

    @Size(max = 1000, message = "Internal notes max 1000 characters")
    @Schema(description = "Internal notes")
    private String internalNotes;

    @NotEmpty(message = "At least one item is required")
    @Size(min = 1, max = 50, message = "Order must have 1-50 items")
    @Schema(description = "Order line items", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<PurchaseOrderItemRequest> items;

    // ─── Item Request DTO ────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Purchase order line item request")
    public static class PurchaseOrderItemRequest {

        @NotNull(message = "Product ID is required")
        @Schema(description = "Product ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Schema(description = "Ordered quantity", requiredMode = Schema.RequiredMode.REQUIRED)
        private Integer orderedQuantity;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
        @Schema(description = "Unit price", requiredMode = Schema.RequiredMode.REQUIRED)
        private BigDecimal unitPrice;

        @DecimalMin(value = "0.0", message = "Tax rate cannot be negative")
        @DecimalMax(value = "100.0", message = "Tax rate cannot exceed 100%")
        @Schema(description = "Tax rate percentage")
        private BigDecimal taxRate;

        @DecimalMin(value = "0.0", message = "Discount cannot be negative")
        @Schema(description = "Discount amount for this line")
        private BigDecimal discountAmount;

        @Size(max = 500, message = "Notes max 500 characters")
        @Schema(description = "Item notes")
        private String notes;
    }
}
