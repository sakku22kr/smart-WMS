package com.smartwms.dto.response;

import com.smartwms.constants.SupplierStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Full supplier response.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {

    private Long   id;
    private String name;
    private String code;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String alternatePhone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pinCode;
    private String gstin;
    private String panNumber;
    private String bankName;
    private String bankAccountNumber;
    private String bankIfsc;
    private BigDecimal creditLimit;
    private Integer paymentTermDays;
    private Double  rating;
    private SupplierStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}
