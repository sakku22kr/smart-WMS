package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

/**
 * Represents a note or history entry for a supplier.
 */
@Entity
@Table(
    name = "supplier_notes",
    indexes = {
        @Index(name = "idx_supplier_note_supplier", columnList = "supplier_id"),
        @Index(name = "idx_supplier_note_type", columnList = "note_type")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"supplier"})
public class SupplierNote extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", nullable = false, length = 30)
    private SupplierNoteType noteType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @Column(name = "pinned", nullable = false)
    private boolean pinned = false;

    public enum SupplierNoteType {
        GENERAL,
        MEETING,
        FOLLOW_UP,
        ISSUE,
        COMPLIANCE,
        CONTRACT,
        PAYMENT
    }
}
