package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregated inventory statistics for the alerts page.
 * Provides a comprehensive view of stock health across the warehouse.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Inventory statistics for alerts and monitoring")
public class InventoryStatisticsResponse {

    @Schema(description = "Total number of products", example = "250")
    private long totalProducts;

    @Schema(description = "Products currently in stock", example = "200")
    private long inStockProducts;

    @Schema(description = "Products with low stock (below reorder level)", example = "35")
    private long lowStockProducts;

    @Schema(description = "Products completely out of stock", example = "15")
    private long outOfStockProducts;

    @Schema(description = "Products with overstock (above 2x reorder level)", example = "8")
    private long overstockedProducts;

    @Schema(description = "Total stock quantity across all products", example = "15000")
    private long totalStockQuantity;

    @Schema(description = "Total inventory value (stock * selling price)", example = "2500000.00")
    private BigDecimal totalInventoryValue;

    @Schema(description = "Average selling price across all products", example = "1250.50")
    private BigDecimal averageSellingPrice;

    @Schema(description = "Stock value in danger zone (low stock products)")
    private BigDecimal lowStockValue;

    @Schema(description = "Products requiring reorder (at or below reorder level)")
    private long productsRequiringReorder;

    @Schema(description = "Total reorder quantity needed to bring all low stock to reorder level")
    private long totalReorderQuantity;

    @Schema(description = "Stock health score (0-100)", example = "85")
    private Integer stockHealthScore;

    @Schema(description = "Stock distribution by status")
    private List<StockDistributionItem> stockDistribution;

    @Schema(description = "Top 5 products requiring immediate reorder")
    private List<LowStockProductResponse> urgentReorderProducts;

    @Schema(description = "Products by category with stock status breakdown")
    private List<CategoryStockSummary> categorySummaries;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Stock distribution item")
    public static class StockDistributionItem {
        @Schema(description = "Status label", example = "In Stock")
        private String label;

        @Schema(description = "Number of products", example = "200")
        private long count;

        @Schema(description = "Percentage of total", example = "80.0")
        private double percentage;

        @Schema(description = "Color code for UI", example = "#22c55e")
        private String color;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Category stock summary")
    public static class CategoryStockSummary {
        @Schema(description = "Category name", example = "Electronics")
        private String categoryName;

        @Schema(description = "Total products in category", example = "50")
        private long totalProducts;

        @Schema(description = "Products with adequate stock", example = "40")
        private long inStockProducts;

        @Schema(description = "Products with low stock", example = "8")
        private long lowStockProducts;

        @Schema(description = "Products out of stock", example = "2")
        private long outOfStockProducts;

        @Schema(description = "Category stock health score", example = "90")
        private Integer categoryHealthScore;
    }
}
