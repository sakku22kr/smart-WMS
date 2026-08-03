package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Filter criteria for inventory history queries.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Inventory history filter criteria")
public class HistoryRequest {

    @Schema(description = "Filter by start date (inclusive)")
    private LocalDateTime dateFrom;

    @Schema(description = "Filter by end date (inclusive)")
    private LocalDateTime dateTo;

    @Schema(description = "Filter by performer username")
    private String performedBy;

    @Schema(description = "Filter by transaction type", example = "STOCK_IN")
    private String transactionType;

    @Schema(description = "Filter by product ID")
    private Long productId;

    @Schema(description = "Filter by warehouse ID")
    private Long warehouseId;

    @Schema(description = "Search keyword (matches reference, reason, batch)")
    private String search;

    @Schema(description = "Page number (0-based)", defaultValue = "0")
    @Builder.Default
    private int page = 0;

    @Schema(description = "Page size", defaultValue = "25")
    @Builder.Default
    private int size = 25;

    @Schema(description = "Sort field", defaultValue = "transactionDate")
    @Builder.Default
    private String sort = "transactionDate";

    @Schema(description = "Sort direction", defaultValue = "desc")
    @Builder.Default
    private String direction = "desc";
}
