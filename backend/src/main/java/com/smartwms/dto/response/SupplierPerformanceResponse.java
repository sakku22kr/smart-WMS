package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Supplier performance analytics response.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier performance analytics")
public class SupplierPerformanceResponse {

    @Schema(description = "Supplier ID")
    private Long supplierId;

    @Schema(description = "Supplier name")
    private String supplierName;

    @Schema(description = "Total number of purchase orders")
    private long totalOrders;

    @Schema(description = "Number of completed orders")
    private long completedOrders;

    @Schema(description = "Number of cancelled orders")
    private long cancelledOrders;

    @Schema(description = "Number of rejected orders")
    private long rejectedOrders;

    @Schema(description = "Number of pending/active orders")
    private long activeOrders;

    @Schema(description = "Order completion rate as percentage", example = "85.5")
    private Double completionRate;

    @Schema(description = "On-time delivery rate as percentage", example = "90.0")
    private Double onTimeDeliveryRate;

    @Schema(description = "Total order value across all non-cancelled orders", example = "150000.00")
    private BigDecimal totalOrderValue;

    @Schema(description = "Average order value", example = "15000.00")
    private BigDecimal averageOrderValue;

    @Schema(description = "Total number of products supplied")
    private long totalProducts;

    @Schema(description = "Current supplier rating (1.0-5.0)")
    private Double rating;

    @Schema(description = "Monthly order counts for the last 6 months")
    private List<MonthlyOrderCount> monthlyOrders;

    @Schema(description = "Most recent order date")
    private LocalDateTime lastOrderDate;

    @Schema(description = "Days since last order", example = "15")
    private Long daysSinceLastOrder;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Monthly order count entry")
    public static class MonthlyOrderCount {
        @Schema(description = "Year-Month label", example = "2026-01")
        private String month;
        @Schema(description = "Number of orders in that month")
        private long orderCount;
        @Schema(description = "Total order value in that month")
        private BigDecimal totalValue;
    }
}
