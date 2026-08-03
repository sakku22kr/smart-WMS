package com.smartwms.entity;

import com.smartwms.constants.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Records a status change event for a purchase order.
 * Used for approval history and status timeline display.
 */
@Entity
@Table(
    name = "purchase_order_status_history",
    indexes = {
        @Index(name = "idx_po_sh_order", columnList = "purchase_order_id"),
        @Index(name = "idx_po_sh_changed_at", columnList = "changed_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"purchaseOrder"})
public class PurchaseOrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private PurchaseOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private PurchaseOrderStatus toStatus;

    @Column(name = "changed_by", nullable = false, length = 150)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(name = "remarks", length = 1000)
    private String remarks;
}
