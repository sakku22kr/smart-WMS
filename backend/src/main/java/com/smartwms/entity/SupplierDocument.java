package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

/**
 * Represents a document attached to a supplier (e.g., GST certificate, PAN card, agreement).
 */
@Entity
@Table(
    name = "supplier_documents",
    indexes = {
        @Index(name = "idx_supplier_doc_supplier", columnList = "supplier_id"),
        @Index(name = "idx_supplier_doc_type", columnList = "document_type")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"supplier"})
public class SupplierDocument extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;
}
