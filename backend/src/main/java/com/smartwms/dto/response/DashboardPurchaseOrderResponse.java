package com.smartwms.dto.response;

import com.smartwms.constants.PurchaseOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lightweight purchase order response for dashboard recent orders list.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dashboard recent purchase order summary")
public class DashboardPurchaseOrderResponse {

    @Schema(description = "Purchase order ID")
    private Long id;

    @Schema(description = "Order number", example = "PO-2026-0001")
    private String orderNumber;

    @Schema(description = "Supplier name")
    private String supplierName;

    @Schema(description = "Total line items count")
    private int totalItems;

    @Schema(description = "Grand total amount")
    private BigDecimal totalAmount;

    @Schema(description = "Order status")
    private PurchaseOrderStatus status;

    @Schema(description = "Order date")
    private LocalDate orderDate;

    @Schema(description = "Created at timestamp")
    private LocalDateTime createdAt;
}
