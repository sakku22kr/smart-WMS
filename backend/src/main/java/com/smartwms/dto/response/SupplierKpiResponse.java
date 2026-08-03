package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier KPI metrics response for analytics cards.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier KPI metrics")
public class SupplierKpiResponse {

    @Schema(description = "Total suppliers")
    private long totalSuppliers;

    @Schema(description = "Active suppliers")
    private long activeSuppliers;

    @Schema(description = "Supplier growth rate (new this month vs last month)", example = "12.5")
    private Double growthRate;

    @Schema(description = "Average rating across all suppliers", example = "4.2")
    private Double averageRating;

    @Schema(description = "Number of 5-star rated suppliers")
    private long fiveStarCount;

    @Schema(description = "Number of suppliers rated below 3")
    private long lowRatedCount;

    @Schema(description = "Total products sourced from suppliers")
    private long totalProductsSourced;

    @Schema(description = "Average products per supplier", example = "15.3")
    private Double avgProductsPerSupplier;

    @Schema(description = "Total procurement value", example = "500000.00")
    private BigDecimal totalProcurementValue;

    @Schema(description = "Average order value across all suppliers", example = "15000.00")
    private BigDecimal averageOrderValue;

    @Schema(description = "Overall on-time delivery rate", example = "92.5")
    private Double onTimeDeliveryRate;

    @Schema(description = "Overall order completion rate", example = "88.0")
    private Double completionRate;

    @Schema(description = "Monthly order trend for last 6 months")
    private List<MonthlyTrend> monthlyTrends;

    @Schema(description = "Top performing suppliers")
    private List<TopPerformer> topPerformers;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private long orderCount;
        private BigDecimal orderValue;
        private long newSuppliers;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPerformer {
        private Long id;
        private String name;
        private String code;
        private Double rating;
        private long orderCount;
        private Double completionRate;
        private Double onTimeRate;
    }
}
