package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Summary statistics for a filtered set of inventory transactions.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Inventory history summary statistics")
public class HistorySummaryResponse {

    @Schema(description = "Total number of transactions matching filter", example = "142")
    private long totalTransactions;

    @Schema(description = "Total quantity of stock-in transactions", example = "5000")
    private long totalStockIn;

    @Schema(description = "Total quantity of stock-out transactions", example = "3200")
    private long totalStockOut;

    @Schema(description = "Total number of adjustment transactions", example = "12")
    private long totalAdjustments;

    @Schema(description = "Total value of all transactions", example = "850000.00")
    private BigDecimal totalValue;

    @Schema(description = "Breakdown of transaction counts by type")
    private Map<String, Long> transactionsByType;

    @Schema(description = "Number of unique products touched", example = "34")
    private long uniqueProducts;

    @Schema(description = "Number of unique warehouses involved", example = "3")
    private long uniqueWarehouses;
}
