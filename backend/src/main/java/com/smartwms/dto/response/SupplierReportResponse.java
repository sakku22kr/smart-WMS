package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier report response with statistics, filters, and paginated data.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier report")
public class SupplierReportResponse {

    @Schema(description = "Total number of suppliers")
    private long totalSuppliers;

    @Schema(description = "Number of active suppliers")
    private long activeSuppliers;

    @Schema(description = "Number of inactive suppliers")
    private long inactiveSuppliers;

    @Schema(description = "Number of blacklisted suppliers")
    private long blacklistedSuppliers;

    @Schema(description = "Average supplier rating")
    private Double averageRating;

    @Schema(description = "Number of suppliers with products")
    private long suppliersWithProducts;

    @Schema(description = "Number of suppliers without products")
    private long suppliersWithoutProducts;

    @Schema(description = "Total procurement value")
    private BigDecimal totalProcurementValue;

    @Schema(description = "Average order value per supplier")
    private BigDecimal averageOrderValue;

    @Schema(description = "Top suppliers by order value")
    private List<SupplierValueEntry> topSuppliersByValue;

    @Schema(description = "Top suppliers by rating")
    private List<SupplierRatingEntry> topSuppliersByRating;

    @Schema(description = "Suppliers grouped by status")
    private List<StatusCount> statusBreakdown;

    @Schema(description = "Suppliers by region/state")
    private List<RegionCount> regionBreakdown;

    @Schema(description = "Applied filters")
    private FilterInfo filters;

    @Schema(description = "Supplier statistics with detailed metrics")
    private SupplierStatistics statistics;

    @Schema(description = "Paginated supplier list for filtered view")
    private SupplierList suppliers;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterInfo {
        private String search;
        private String status;
        private String region;
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
    public static class SupplierStatistics {
        private long totalSuppliers;
        private long activeSuppliers;
        private long inactiveSuppliers;
        private long blacklistedSuppliers;
        private Double averageRating;
        private long suppliersWithProducts;
        private long suppliersWithoutProducts;
        private BigDecimal totalProcurementValue;
        private BigDecimal averageOrderValue;
        private long totalOrders;
        private long regionCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierList {
        private List<SupplierEntry> items;
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
    public static class SupplierEntry {
        private Long id;
        private String name;
        private String code;
        private String companyName;
        private String contactPerson;
        private String email;
        private String phone;
        private String city;
        private String state;
        private Double rating;
        private String status;
        private long productCount;
        private long orderCount;
        private BigDecimal totalOrderValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierValueEntry {
        private Long id;
        private String name;
        private String code;
        private String companyName;
        private long orderCount;
        private BigDecimal totalOrderValue;
        private Double rating;
        private long productCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierRatingEntry {
        private Long id;
        private String name;
        private String code;
        private Double rating;
        private long productCount;
        private long orderCount;
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
    public static class RegionCount {
        private String region;
        private long count;
        private BigDecimal totalValue;
    }
}
