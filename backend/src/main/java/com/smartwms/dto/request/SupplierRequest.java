package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.SupplierStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request payload for creating or updating a Supplier.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    private String name;

    @NotBlank(message = "Supplier code is required")
    @Size(min = 2, max = 30, message = "Code must be between 2 and 30 characters")
    @Pattern(regexp = AppConstants.Patterns.CODE, message = "Code must contain only uppercase letters, digits, hyphens, or underscores")
    private String code;

    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    @Size(max = 150, message = "Contact person name must not exceed 150 characters")
    private String contactPerson;

    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Pattern(regexp = AppConstants.Patterns.PHONE, message = "Invalid phone number format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Pattern(regexp = AppConstants.Patterns.PHONE, message = "Invalid alternate phone number format")
    @Size(max = 20, message = "Alternate phone must not exceed 20 characters")
    private String alternatePhone;

    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 20, message = "Pin code must not exceed 20 characters")
    private String pinCode;

    @Pattern(regexp = AppConstants.Patterns.GSTIN, message = "Invalid GSTIN format")
    private String gstin;

    @Pattern(regexp = AppConstants.Patterns.PAN, message = "Invalid PAN number format")
    private String panNumber;

    @Size(max = 150, message = "Bank name must not exceed 150 characters")
    private String bankName;

    @Size(max = 50, message = "Bank account number must not exceed 50 characters")
    private String bankAccountNumber;

    @Pattern(regexp = AppConstants.Patterns.IFSC, message = "Invalid IFSC code format")
    private String bankIfsc;

    @DecimalMin(value = "0.0", inclusive = true, message = "Credit limit must be 0 or greater")
    @Digits(integer = 13, fraction = 2, message = "Credit limit must be a valid monetary amount")
    private BigDecimal creditLimit;

    @Min(value = 0, message = "Payment term days must be 0 or greater")
    @Max(value = 365, message = "Payment term days must not exceed 365")
    private Integer paymentTermDays;

    @Builder.Default
    private SupplierStatus status = SupplierStatus.ACTIVE;

    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    private BigDecimal rating;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
