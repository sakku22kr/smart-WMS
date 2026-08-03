package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response payload for supplier contacts.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Supplier contact response")
public class SupplierContactResponse {

    @Schema(description = "Contact ID")
    private Long id;

    @Schema(description = "Supplier ID")
    private Long supplierId;

    @Schema(description = "Contact name", example = "Rajesh Kumar")
    private String name;

    @Schema(description = "Designation", example = "Purchase Manager")
    private String designation;

    @Schema(description = "Department", example = "Procurement")
    private String department;

    @Schema(description = "Email address", example = "rajesh@supplier.com")
    private String email;

    @Schema(description = "Phone number", example = "+91-9876543210")
    private String phone;

    @Schema(description = "Alternate phone number")
    private String alternatePhone;

    @Schema(description = "Whether this is the primary contact", example = "true")
    private boolean primary;

    @Schema(description = "Additional notes")
    private String notes;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Created by")
    private String createdBy;
}
