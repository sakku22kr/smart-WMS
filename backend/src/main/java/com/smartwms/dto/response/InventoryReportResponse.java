package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Inventory report response with stock summaries, sub-reports, and breakdowns.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Inventory report")
public class InventoryReportResponse {

    @Schema(description = "Total number of products")
    private long totalProducts;

    @Schema(description = "Total stock quantity across all products")
    private long totalStockQuantity;

    @Schema(description = "Total inventory value (stock * selling price)")
    private BigDecimal totalInventoryValue;

    @Schema(description = "Average selling price")
    private BigDecimal averageSellingPrice;

    @Schema(description = "Number of low-stock products")
    private long lowStockCount;

    @Schema(description = "Number of out-of-stock products")
    private long outOfStockCount;

    @Schema(description = "Number of active products")
    private long activeProducts;

    @Schema(description = "Number of inactive products")
    private long inactiveProducts;

    @Schema(description = "Products grouped by category with stock counts")
    private List<CategoryStockEntry> categoryBreakdown;

    @Schema(description = "Products grouped by warehouse with stock counts")
    private List<WarehouseStockEntry> warehouseBreakdown;

    @Schema(description = "Top products by stock value")
    private List<ProductStockEntry> topProductsByValue;

    @Schema(description = "Products needing reorder")
    private List<ProductStockEntry> reorderAlerts;

    @Schema(description = "Transaction summary")
    private TransactionSummary transactionSummary;

    @Schema(description = "Applied filters")
    private FilterInfo filters;

    // ─── Sub-report: Full Stock Report ───────────────────────

    @Schema(description = "Full stock report with paginated product list")
    private StockReport stockReport;

    @Schema(description = "Low stock report — products at or below reorder level")
    private LowStockReport lowStockReport;

    @Schema(description = "Out of stock report — products with zero stock")
    private OutOfStockReport outOfStockReport;

    @Schema(description = "Inventory value report — value breakdown by category and warehouse")
    private InventoryValueReport inventoryValueReport;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterInfo {
        private LocalDateTime dateFrom;
        private LocalDateTime dateTo;
        private Long warehouseId;
        private String warehouseName;
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
    public static class CategoryStockEntry {
        private String categoryName;
        private long productCount;
        private long totalStock;
        private BigDecimal totalValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStockEntry {
        private String warehouseName;
        private String warehouseCode;
        private long productCount;
        private long totalStock;
        private Double capacityUtilization;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStockEntry {
        private Long id;
        private String name;
        private String sku;
        private String categoryName;
        private String warehouseName;
        private Integer currentStock;
        private Integer reservedStock;
        private Integer reorderLevel;
        private BigDecimal sellingPrice;
        private BigDecimal purchasePrice;
        private BigDecimal stockValue;
        private String status;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {
        private long totalTransactions;
        private long stockInCount;
        private long stockOutCount;
        private long adjustmentCount;
        private BigDecimal totalInValue;
        private BigDecimal totalOutValue;
    }

    // ─── Stock Report DTO ────────────────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockReport {
        private List<ProductStockEntry> products;
        private long totalProducts;
        private long totalStockQuantity;
        private BigDecimal totalInventoryValue;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    // ─── Low Stock Report DTO ────────────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockReport {
        private List<ProductStockEntry> products;
        private long totalLowStock;
        private long totalProducts;
        private BigDecimal totalReorderValue;
    }

    // ─── Out of Stock Report DTO ─────────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OutOfStockReport {
        private List<ProductStockEntry> products;
        private long totalOutOfStock;
        private long totalProducts;
        private BigDecimal totalLostValue;
    }

    // ─── Inventory Value Report DTO ──────────────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryValueReport {
        private BigDecimal totalValue;
        private BigDecimal totalPurchaseValue;
        private BigDecimal totalSellingValue;
        private BigDecimal potentialProfit;
        private List<CategoryValueEntry> byCategory;
        private List<WarehouseValueEntry> byWarehouse;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryValueEntry {
        private String categoryName;
        private long productCount;
        private long totalStock;
        private BigDecimal purchaseValue;
        private BigDecimal sellingValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseValueEntry {
        private String warehouseName;
        private String warehouseCode;
        private long productCount;
        private long totalStock;
        private BigDecimal purchaseValue;
        private BigDecimal sellingValue;
    }
}
