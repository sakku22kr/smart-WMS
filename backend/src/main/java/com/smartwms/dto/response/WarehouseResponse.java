package com.smartwms.dto.response;

import com.smartwms.constants.WarehouseStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Warehouse response payload")
public class WarehouseResponse {

    @Schema(description = "Unique warehouse identifier", example = "1")
    private Long id;

    @Schema(description = "Warehouse name", example = "Mumbai Central Hub")
    private String name;

    @Schema(description = "Unique warehouse code", example = "WH-001")
    private String code;

    @Schema(description = "Warehouse location", example = "Mumbai, Maharashtra")
    private String location;

    @Schema(description = "Full warehouse address", example = "123 Industrial Area, Andheri East, Mumbai 400069")
    private String address;

    @Schema(description = "Warehouse manager name", example = "Rajesh Kumar")
    private String manager;

    @Schema(description = "Contact phone number", example = "+91-98765-43210")
    private String contactNumber;

    @Schema(description = "Warehouse contact email", example = "mumbai-hub@smartwms.com")
    private String email;

    @Schema(description = "Total warehouse capacity in cubic meters", example = "10000.0")
    private Double capacity;

    @Schema(description = "Current storage utilization in cubic meters", example = "5500.0")
    private Double currentUtilization;

    @Schema(description = "Capacity utilization percentage", example = "55.0")
    private Double utilizationPercentage;

    @Schema(description = "Warehouse operational status", example = "ACTIVE")
    private WarehouseStatus status;

    @Schema(description = "Brief warehouse description", example = "Primary distribution center for Western India")
    private String description;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "User who created this record")
    private String createdBy;
}
