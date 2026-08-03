package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

/**
 * Aggregate supplier statistics for dashboard and reporting.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregate supplier statistics")
public class SupplierStatsResponse {

    @Schema(description = "Total number of suppliers", example = "25")
    private long totalSuppliers;

    @Schema(description = "Number of active suppliers", example = "20")
    private long activeCount;

    @Schema(description = "Number of inactive suppliers", example = "3")
    private long inactiveCount;

    @Schema(description = "Number of blacklisted suppliers", example = "2")
    private long blacklistedCount;

    @Schema(description = "Average supplier rating", example = "4.2")
    private Double averageRating;

    @Schema(description = "Number of suppliers with assigned products", example = "15")
    private long suppliersWithProducts;

    @Schema(description = "Number of suppliers without assigned products", example = "10")
    private long suppliersWithoutProducts;

    @Schema(description = "Total purchase order value from all suppliers", example = "500000.00")
    private BigDecimal totalPOValue;

    @Schema(description = "Number of active purchase orders", example = "8")
    private long activePOCount;
}
