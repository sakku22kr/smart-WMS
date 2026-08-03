package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier dashboard overview response for the main dashboard.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier dashboard overview")
public class SupplierDashboardResponse {

    @Schema(description = "Total number of suppliers")
    private long totalSuppliers;

    @Schema(description = "Number of active suppliers")
    private long activeSuppliers;

    @Schema(description = "Number of inactive suppliers")
    private long inactiveSuppliers;

    @Schema(description = "Number of blacklisted suppliers")
    private long blacklistedSuppliers;

    @Schema(description = "Average supplier rating", example = "4.2")
    private Double averageRating;

    @Schema(description = "Total purchase order value", example = "500000.00")
    private BigDecimal totalPOValue;

    @Schema(description = "Number of active purchase orders")
    private long activePOCount;

    @Schema(description = "Number of pending purchase orders")
    private long pendingPOCount;

    @Schema(description = "Number of completed purchase orders")
    private long completedPOCount;

    @Schema(description = "Suppliers with expiring documents in next 30 days")
    private long expiringDocumentsCount;

    @Schema(description = "Recent supplier activities")
    private List<SupplierTimelineEntry> recentActivities;

    @Schema(description = "Top suppliers by order value")
    private List<TopSupplier> topSuppliersByValue;

    @Schema(description = "Supplier status distribution")
    private List<StatusCount> statusDistribution;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSupplier {
        private Long id;
        private String name;
        private String code;
        private BigDecimal totalOrderValue;
        private long orderCount;
        private Double rating;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }
}
