package com.smartwms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload for creating or updating a supplier contact.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierContactRequest {

    @NotBlank(message = "Contact name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 20, message = "Alternate phone must not exceed 20 characters")
    private String alternatePhone;

    @Builder.Default
    private boolean primary = false;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
