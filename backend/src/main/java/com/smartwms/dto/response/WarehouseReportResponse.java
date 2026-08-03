package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Warehouse report response with statistics, utilization details, and breakdowns.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Warehouse report")
public class WarehouseReportResponse {

    @Schema(description = "Total number of warehouses")
    private long totalWarehouses;

    @Schema(description = "Number of active warehouses")
    private long activeWarehouses;

    @Schema(description = "Number of inactive warehouses")
    private long inactiveWarehouses;

    @Schema(description = "Number of warehouses under maintenance")
    private long maintenanceWarehouses;

    @Schema(description = "Total warehouse capacity")
    private Double totalCapacity;

    @Schema(description = "Total current utilization")
    private Double totalUtilization;

    @Schema(description = "Overall utilization percentage")
    private Double utilizationPercentage;

    @Schema(description = "Number of warehouses at or near capacity (>=90%)")
    private long nearCapacityCount;

    @Schema(description = "Number of warehouses at full capacity")
    private long fullCapacityCount;

    @Schema(description = "Warehouse details")
    private List<WarehouseEntry> warehouses;

    @Schema(description = "Products stored per warehouse")
    private List<WarehouseProductCount> productsPerWarehouse;

    @Schema(description = "Purchase orders per warehouse")
    private List<WarehousePOCount> ordersPerWarehouse;

    @Schema(description = "Warehouse statistics")
    private WarehouseStatistics statistics;

    @Schema(description = "Utilization breakdown per warehouse")
    private List<UtilizationEntry> utilizationBreakdown;

    @Schema(description = "Inventory value per warehouse")
    private List<WarehouseValueEntry> valueBreakdown;

    @Schema(description = "Status distribution")
    private List<StatusCount> statusBreakdown;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStatistics {
        private long totalWarehouses;
        private long activeWarehouses;
        private long inactiveWarehouses;
        private long maintenanceWarehouses;
        private Double totalCapacity;
        private Double totalUtilization;
        private Double utilizationPercentage;
        private long nearCapacityCount;
        private long fullCapacityCount;
        private long totalProducts;
        private long totalStockQuantity;
        private BigDecimal totalInventoryValue;
        private long totalPurchaseOrders;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationEntry {
        private Long id;
        private String name;
        private String code;
        private Double capacity;
        private Double currentUtilization;
        private Double utilizationPercent;
        private long productCount;
        private String status;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseValueEntry {
        private Long id;
        private String name;
        private String code;
        private long productCount;
        private long totalStock;
        private BigDecimal inventoryValue;
        private BigDecimal purchaseValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseEntry {
        private Long id;
        private String name;
        private String code;
        private String location;
        private String manager;
        private Double capacity;
        private Double currentUtilization;
        private Double utilizationPercent;
        private String status;
        private long productCount;
        private long totalStock;
        private BigDecimal inventoryValue;
        private long activeOrders;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseProductCount {
        private String warehouseName;
        private String warehouseCode;
        private long productCount;
        private long totalStock;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehousePOCount {
        private String warehouseName;
        private long orderCount;
        private long activeOrders;
        private BigDecimal totalValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
        private Double totalCapacity;
        private Double totalUtilization;
    }
}
