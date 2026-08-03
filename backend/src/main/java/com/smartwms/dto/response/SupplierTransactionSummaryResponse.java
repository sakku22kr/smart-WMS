package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Supplier transaction summary response.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier transaction summary")
public class SupplierTransactionSummaryResponse {

    @Schema(description = "Total number of transactions (purchase orders)")
    private long totalTransactions;

    @Schema(description = "Total transaction value", example = "500000.00")
    private BigDecimal totalValue;

    @Schema(description = "Average transaction value", example = "15000.00")
    private BigDecimal averageValue;

    @Schema(description = "Number of transactions this month")
    private long thisMonthCount;

    @Schema(description = "Transaction value this month", example = "50000.00")
    private BigDecimal thisMonthValue;

    @Schema(description = "Number of transactions last month")
    private long lastMonthCount;

    @Schema(description = "Transaction value last month", example = "45000.00")
    private BigDecimal lastMonthValue;

    @Schema(description = "Month-over-month growth percentage", example = "11.1")
    private Double monthOverMonthGrowth;

    @Schema(description = "Most recent transaction date")
    private LocalDate lastTransactionDate;

    @Schema(description = "Transactions by status")
    private List<StatusBreakdown> statusBreakdown;

    @Schema(description = "Top suppliers by transaction count")
    private List<SupplierTransaction> topSuppliers;

    @Schema(description = "Monthly transaction totals for last 6 months")
    private List<MonthlyTotal> monthlyTotals;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusBreakdown {
        private String status;
        private long count;
        private BigDecimal value;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierTransaction {
        private Long supplierId;
        private String supplierName;
        private String supplierCode;
        private long transactionCount;
        private BigDecimal totalValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTotal {
        private String month;
        private long count;
        private BigDecimal value;
    }
}
