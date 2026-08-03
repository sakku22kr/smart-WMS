package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Unified timeline entry for supplier activity (combines activity logs and PO status changes).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier timeline entry")
public class SupplierTimelineEntry {

    @Schema(description = "Unique entry identifier", example = "1")
    private Long id;

    @Schema(description = "Type of entry: ACTIVITY or PO_STATUS")
    private String entryType;

    @Schema(description = "Activity type or PO status", example = "SUPPLIER_UPDATED")
    private String type;

    @Schema(description = "Human-readable description")
    private String description;

    @Schema(description = "Actor who performed the action", example = "admin@smartwms.io")
    private String actor;

    @Schema(description = "Timestamp of the event")
    private LocalDateTime timestamp;

    @Schema(description = "Additional metadata as JSON")
    private String metadata;

    @Schema(description = "Related PO order number (if applicable)", example = "PO-2026-001")
    private String orderNumber;

    @Schema(description = "Related PO ID (if applicable)")
    private Long purchaseOrderId;
}
