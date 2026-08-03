package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product catalog report response with statistics, filters, and paginated data.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product report")
public class ProductReportResponse {

    @Schema(description = "Total number of products")
    private long totalProducts;

    @Schema(description = "Number of active products")
    private long activeProducts;

    @Schema(description = "Number of inactive products")
    private long inactiveProducts;

    @Schema(description = "Number of discontinued products")
    private long discontinuedProducts;

    @Schema(description = "Total catalog value (sum of all selling prices)")
    private BigDecimal totalCatalogValue;

    @Schema(description = "Average product price")
    private BigDecimal averagePrice;

    @Schema(description = "Number of products without a supplier")
    private long productsWithoutSupplier;

    @Schema(description = "Number of products without a warehouse")
    private long productsWithoutWarehouse;

    @Schema(description = "Products grouped by category")
    private List<CategoryProductEntry> categoryBreakdown;

    @Schema(description = "Products grouped by supplier")
    private List<SupplierProductEntry> supplierBreakdown;

    @Schema(description = "Products grouped by status")
    private List<StatusCount> statusBreakdown;

    @Schema(description = "Top products by price")
    private List<ProductEntry> topProductsByPrice;

    @Schema(description = "Recently added products")
    private List<ProductEntry> recentProducts;

    @Schema(description = "Applied filters")
    private FilterInfo filters;

    @Schema(description = "Product statistics with detailed metrics")
    private ProductStatistics statistics;

    @Schema(description = "Paginated product list for filtered view")
    private ProductList products;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterInfo {
        private String search;
        private Long categoryId;
        private String categoryName;
        private Long supplierId;
        private String supplierName;
        private String status;
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
    public static class ProductStatistics {
        private long totalProducts;
        private long activeProducts;
        private long inactiveProducts;
        private long discontinuedProducts;
        private BigDecimal totalCatalogValue;
        private BigDecimal totalStockValue;
        private BigDecimal averagePrice;
        private BigDecimal averageStock;
        private long totalStockQuantity;
        private long lowStockCount;
        private long outOfStockCount;
        private long productsWithSupplier;
        private long productsWithoutSupplier;
        private long productsWithWarehouse;
        private long productsWithoutWarehouse;
        private long categoryCount;
        private long supplierCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductList {
        private List<ProductEntry> items;
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
    public static class CategoryProductEntry {
        private String categoryName;
        private long productCount;
        private BigDecimal totalValue;
        private long totalStock;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierProductEntry {
        private Long supplierId;
        private String supplierName;
        private String supplierCode;
        private long productCount;
        private BigDecimal totalValue;
        private long totalStock;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
        private BigDecimal totalValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductEntry {
        private Long id;
        private String name;
        private String sku;
        private String categoryName;
        private String supplierName;
        private String warehouseName;
        private BigDecimal sellingPrice;
        private BigDecimal purchasePrice;
        private Integer currentStock;
        private Integer reorderLevel;
        private BigDecimal stockValue;
        private String status;
    }
}
