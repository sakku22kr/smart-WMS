package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

/**
 * Represents a contact person for a supplier.
 */
@Entity
@Table(
    name = "supplier_contacts",
    indexes = {
        @Index(name = "idx_supplier_contact_supplier", columnList = "supplier_id"),
        @Index(name = "idx_supplier_contact_email", columnList = "email")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"supplier"})
public class SupplierContact extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "notes", length = 500)
    private String notes;
}
