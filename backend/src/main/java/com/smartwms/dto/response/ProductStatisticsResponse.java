package com.smartwms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregated product statistics for the dashboard.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatisticsResponse {

    private long totalProducts;
    private long activeProducts;
    private long inactiveProducts;
    private long discontinuedProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private long totalStockQuantity;
    private BigDecimal totalInventoryValue;
    private BigDecimal averageSellingPrice;
    private List<StockDistributionItem> stockDistribution;
    private List<CategoryProductCount> productsByCategory;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockDistributionItem {
        private String label;
        private long count;
        private String color;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryProductCount {
        private String categoryName;
        private long productCount;
        private BigDecimal totalValue;
    }
}
