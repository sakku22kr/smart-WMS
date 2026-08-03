package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregate warehouse capacity statistics")
public class WarehouseStatsResponse {

    @Schema(description = "Total number of warehouses", example = "12")
    private long totalWarehouses;

    @Schema(description = "Number of active warehouses", example = "10")
    private long activeCount;

    @Schema(description = "Number of inactive warehouses", example = "1")
    private long inactiveCount;

    @Schema(description = "Number of warehouses under maintenance", example = "1")
    private long maintenanceCount;

    @Schema(description = "Sum of all warehouse capacities in cubic meters", example = "125000.0")
    private Double totalCapacity;

    @Schema(description = "Sum of current utilization across all warehouses in cubic meters", example = "87500.0")
    private Double totalUtilized;

    @Schema(description = "Available capacity across all warehouses in cubic meters", example = "37500.0")
    private Double availableCapacity;

    @Schema(description = "Average utilization percentage across all warehouses", example = "70.0")
    private Double avgUtilization;

    @Schema(description = "Number of warehouses at or above 90% capacity", example = "3")
    private long warehousesNearCapacity;

    @Schema(description = "Number of warehouses at 100% capacity", example = "1")
    private long warehousesFull;
}
