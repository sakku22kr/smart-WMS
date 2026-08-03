package com.smartwms.entity;

import com.smartwms.constants.AuditEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Audit log entry for product-related events.
 *
 * <p>Every create, update, delete, status change, and stock operation
 * on a Product is recorded here for full traceability.</p>
 */
@Entity
@Table(
    name = "product_audit_logs",
    indexes = {
        @Index(name = "idx_audit_product_id", columnList = "product_id"),
        @Index(name = "idx_audit_event_type", columnList = "event_type"),
        @Index(name = "idx_audit_performed_by", columnList = "performed_by"),
        @Index(name = "idx_audit_performed_at", columnList = "performed_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ProductAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private AuditEventType eventType;

    @Column(name = "performed_by", nullable = false, length = 150)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(name = "description", length = 500)
    private String description;

    /** JSON snapshot of the product state before the change. */
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    /** JSON snapshot of the product state after the change. */
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
