package com.smartwms.dto.response;

import com.smartwms.constants.AuditEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product audit log entry")
public class ProductAuditResponse {

    @Schema(description = "Audit log ID")
    private Long id;

    @Schema(description = "Product ID associated with this event")
    private Long productId;

    @Schema(description = "Product name")
    private String productName;

    @Schema(description = "Product SKU")
    private String productSku;

    @Schema(description = "Audit event type", example = "PRODUCT_UPDATED")
    private AuditEventType eventType;

    @Schema(description = "Username of the person who performed the action")
    private String performedBy;

    @Schema(description = "When the event occurred")
    private LocalDateTime performedAt;

    @Schema(description = "Human-readable description of what happened")
    private String description;

    @Schema(description = "JSON snapshot before the change")
    private String oldValue;

    @Schema(description = "JSON snapshot after the change")
    private String newValue;

    @Schema(description = "IP address of the performer")
    private String ipAddress;
}
