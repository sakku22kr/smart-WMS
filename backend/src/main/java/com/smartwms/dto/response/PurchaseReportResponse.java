package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Purchase order report response with statistics, filters, and breakdowns.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Purchase report")
public class PurchaseReportResponse {

    @Schema(description = "Total number of purchase orders")
    private long totalOrders;

    @Schema(description = "Total procurement value")
    private BigDecimal totalValue;

    @Schema(description = "Average order value")
    private BigDecimal averageOrderValue;

    @Schema(description = "Number of draft orders")
    private long draftCount;

    @Schema(description = "Number of pending orders")
    private long pendingCount;

    @Schema(description = "Number of approved orders")
    private long approvedCount;

    @Schema(description = "Number of completed orders")
    private long completedCount;

    @Schema(description = "Number of cancelled orders")
    private long cancelledCount;

    @Schema(description = "Number of rejected orders")
    private long rejectedCount;

    @Schema(description = "Number of active (in-progress) orders")
    private long activeCount;

    @Schema(description = "Orders grouped by status")
    private List<StatusValueEntry> statusBreakdown;

    @Schema(description = "Monthly order counts for last 12 months")
    private List<MonthlyOrderEntry> monthlyTrend;

    @Schema(description = "Top suppliers by order value")
    private List<SupplierOrderEntry> topSuppliers;

    @Schema(description = "Orders by warehouse")
    private List<WarehouseOrderEntry> warehouseBreakdown;

    @Schema(description = "Most recent orders")
    private List<OrderSummaryEntry> recentOrders;

    @Schema(description = "Date range start")
    private LocalDate dateFrom;

    @Schema(description = "Date range end")
    private LocalDate dateTo;

    @Schema(description = "Purchase statistics")
    private PurchaseStatistics statistics;

    @Schema(description = "Applied filters")
    private FilterInfo filters;

    @Schema(description = "Paginated order list for filtered view")
    private OrderList orders;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseStatistics {
        private long totalOrders;
        private BigDecimal totalValue;
        private BigDecimal averageOrderValue;
        private long activeCount;
        private long completedCount;
        private long cancelledCount;
        private long pendingCount;
        private long approvedCount;
        private long draftCount;
        private long rejectedCount;
        private BigDecimal completedValue;
        private BigDecimal pendingValue;
        private BigDecimal averageProcessingDays;
        private long uniqueSuppliers;
        private long uniqueWarehouses;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterInfo {
        private String search;
        private Long supplierId;
        private String supplierName;
        private Long warehouseId;
        private String warehouseName;
        private String status;
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private String sortBy;
        private String sortDir;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderList {
        private List<OrderSummaryEntry> items;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusValueEntry {
        private String status;
        private long count;
        private BigDecimal totalValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyOrderEntry {
        private String month;
        private long orderCount;
        private BigDecimal totalValue;
        private long completedCount;
        private long pendingCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierOrderEntry {
        private Long supplierId;
        private String supplierName;
        private String supplierCode;
        private long orderCount;
        private BigDecimal totalValue;
        private long completedCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseOrderEntry {
        private Long warehouseId;
        private String warehouseName;
        private long orderCount;
        private BigDecimal totalValue;
        private long activeOrders;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummaryEntry {
        private Long id;
        private String orderNumber;
        private String supplierName;
        private String supplierCode;
        private String warehouseName;
        private LocalDate orderDate;
        private LocalDate expectedDelivery;
        private BigDecimal totalAmount;
        private String status;
        private int itemCount;
    }
}
