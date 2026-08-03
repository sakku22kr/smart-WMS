package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.WarehouseStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating or updating a warehouse")
public class WarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Warehouse name", example = "Mumbai Central Hub", minLength = 2, maxLength = 100)
    private String name;

    @NotBlank(message = "Warehouse code is required")
    @Size(min = 2, max = 50, message = "Code must be between 2 and 50 characters")
    @Pattern(regexp = AppConstants.Patterns.CODE, message = "Code must contain only uppercase letters, digits, hyphens, or underscores")
    @Schema(description = "Unique warehouse code", example = "WH-001", minLength = 2, maxLength = 50)
    private String code;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    @Schema(description = "Warehouse location", example = "Mumbai, Maharashtra")
    private String location;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Schema(description = "Full warehouse address", example = "123 Industrial Area, Andheri East, Mumbai 400069")
    private String address;

    @Size(max = 100, message = "Manager name must not exceed 100 characters")
    @Schema(description = "Warehouse manager name", example = "Rajesh Kumar")
    private String manager;

    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    @Pattern(regexp = "^$|" + AppConstants.Patterns.PHONE, message = "Invalid phone number format")
    @Schema(description = "Contact phone number", example = "+91-98765-43210")
    private String contactNumber;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Schema(description = "Warehouse contact email", example = "mumbai-hub@smartwms.com")
    private String email;

    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity must be 0 or greater")
    @Schema(description = "Total warehouse capacity in cubic meters", example = "10000.0", defaultValue = "0.0")
    @Builder.Default
    private Double capacity = 0.0;

    @Min(value = 0, message = "Current utilization must be 0 or greater")
    @Schema(description = "Current storage utilization in cubic meters", example = "5500.0", defaultValue = "0.0")
    @Builder.Default
    private Double currentUtilization = 0.0;

    @Schema(description = "Warehouse operational status", defaultValue = "ACTIVE")
    @Builder.Default
    private WarehouseStatus status = WarehouseStatus.ACTIVE;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Brief description of the warehouse", example = "Primary distribution center for Western India")
    private String description;
}
