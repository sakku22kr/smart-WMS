package com.smartwms.dto.response;

import com.smartwms.constants.PurchaseOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response payload for a purchase order.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Purchase order response")
public class PurchaseOrderResponse {

    @Schema(description = "Purchase order ID")
    private Long id;

    @Schema(description = "Order number", example = "PO-2026-0001")
    private String orderNumber;

    @Schema(description = "Order status")
    private PurchaseOrderStatus status;

    @Schema(description = "Order date")
    private LocalDate orderDate;

    @Schema(description = "Expected delivery date")
    private LocalDate expectedDeliveryDate;

    @Schema(description = "Actual delivery date")
    private LocalDate actualDeliveryDate;

    // ─── Supplier Info ──────────────────────────────────────
    @Schema(description = "Supplier ID")
    private Long supplierId;

    @Schema(description = "Supplier name")
    private String supplierName;

    @Schema(description = "Supplier code")
    private String supplierCode;

    // ─── Warehouse Info ─────────────────────────────────────
    @Schema(description = "Warehouse ID")
    private Long warehouseId;

    @Schema(description = "Warehouse name")
    private String warehouseName;

    // ─── Financials ─────────────────────────────────────────
    @Schema(description = "Subtotal before tax/shipping/discount")
    private BigDecimal subtotal;

    @Schema(description = "Tax amount")
    private BigDecimal taxAmount;

    @Schema(description = "Shipping cost")
    private BigDecimal shippingCost;

    @Schema(description = "Discount amount")
    private BigDecimal discountAmount;

    @Schema(description = "Grand total")
    private BigDecimal totalAmount;

    @Schema(description = "Currency code")
    private String currency;

    // ─── Counts ─────────────────────────────────────────────
    @Schema(description = "Total number of line items")
    private int totalItems;

    @Schema(description = "Total ordered quantity")
    private int totalQuantity;

    @Schema(description = "Total received quantity")
    private int totalReceivedQuantity;

    // ─── Meta ───────────────────────────────────────────────
    @Schema(description = "Payment terms")
    private String paymentTerms;

    @Schema(description = "Shipping address")
    private String shippingAddress;

    @Schema(description = "Notes")
    private String notes;

    @Schema(description = "Internal notes")
    private String internalNotes;

    @Schema(description = "Approved by")
    private String approvedBy;

    @Schema(description = "Approved at")
    private LocalDateTime approvedAt;

    @Schema(description = "Received by")
    private String receivedBy;

    @Schema(description = "Received at")
    private LocalDateTime receivedAt;

    @Schema(description = "Line items")
    private List<PurchaseOrderItemResponse> items;

    // ─── Status History ─────────────────────────────────────
    @Schema(description = "Status change history")
    private List<PurchaseOrderStatusHistoryResponse> statusHistory;

    @Schema(description = "Rejected by")
    private String rejectedBy;

    @Schema(description = "Rejected at")
    private LocalDateTime rejectedAt;

    @Schema(description = "Cancelled by")
    private String cancelledBy;

    @Schema(description = "Cancelled at")
    private LocalDateTime cancelledAt;

    @Schema(description = "Whether inventory has been adjusted for this order")
    private Boolean inventoryAdjusted;

    // ─── Audit ──────────────────────────────────────────────
    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;

    @Schema(description = "Created by")
    private String createdBy;

    @Schema(description = "Updated by")
    private String updatedBy;

    // ─── Item Response DTO ──────────────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Purchase order line item response")
    public static class PurchaseOrderItemResponse {

        @Schema(description = "Item ID")
        private Long id;

        @Schema(description = "Product ID")
        private Long productId;

        @Schema(description = "Product name")
        private String productName;

        @Schema(description = "Product SKU")
        private String productSku;

        @Schema(description = "Ordered quantity")
        private Integer orderedQuantity;

        @Schema(description = "Received quantity")
        private Integer receivedQuantity;

        @Schema(description = "Pending quantity")
        private Integer pendingQuantity;

        @Schema(description = "Unit price")
        private BigDecimal unitPrice;

        @Schema(description = "Tax rate percentage")
        private BigDecimal taxRate;

        @Schema(description = "Tax amount")
        private BigDecimal taxAmount;

        @Schema(description = "Discount amount")
        private BigDecimal discountAmount;

        @Schema(description = "Line total")
        private BigDecimal lineTotal;

        @Schema(description = "Item notes")
        private String notes;

        @Schema(description = "Sort order")
        private Integer sortOrder;
    }

    // ─── Status History Response DTO ─────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Purchase order status history entry")
    public static class PurchaseOrderStatusHistoryResponse {

        @Schema(description = "History entry ID")
        private Long id;

        @Schema(description = "Previous status")
        private PurchaseOrderStatus fromStatus;

        @Schema(description = "New status")
        private PurchaseOrderStatus toStatus;

        @Schema(description = "Changed by user")
        private String changedBy;

        @Schema(description = "Changed at timestamp")
        private java.time.LocalDateTime changedAt;

        @Schema(description = "Remarks or reason")
        private String remarks;
    }
}
