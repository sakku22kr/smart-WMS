package com.smartwms.entity;

import com.smartwms.constants.SupplierStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

/**
 * Represents a vendor/supplier from whom products are procured.
 */
@Entity
@Table(
    name = "suppliers",
    indexes = {
        @Index(name = "idx_supplier_code",  columnList = "code",  unique = true),
        @Index(name = "idx_supplier_email", columnList = "email"),
        @Index(name = "idx_supplier_status", columnList = "status")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Supplier extends SoftDeleteEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /** Unique supplier code (e.g., SUP-001). */
    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "pin_code", length = 20)
    private String pinCode;

    /** GST Identification Number (India). */
    @Column(name = "gstin", length = 20)
    private String gstin;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_ifsc", length = 20)
    private String bankIfsc;

    /** Maximum credit value allowed for purchase orders. */
    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    /** Payment due period in days. */
    @Column(name = "payment_term_days")
    private Integer paymentTermDays = 30;

    /** Supplier rating on a scale of 1.0–5.0. */
    @Column(name = "rating")
    private Double rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SupplierStatus status = SupplierStatus.ACTIVE;

    @Column(name = "notes", length = 1000)
    private String notes;
}
