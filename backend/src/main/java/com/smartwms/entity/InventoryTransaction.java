package com.smartwms.entity;

import com.smartwms.constants.InventoryTransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents an individual inventory transaction (stock movement).
 *
 * <p>Every stock change — in, out, adjustment, transfer, reservation, dispatch —
 * is recorded as a transaction for full audit trail and traceability.</p>
 */
@Entity
@Table(
    name = "inventory_transactions",
    indexes = {
        @Index(name = "idx_inv_txn_product",   columnList = "product_id"),
        @Index(name = "idx_inv_txn_warehouse",  columnList = "warehouse_id"),
        @Index(name = "idx_inv_txn_type",       columnList = "transaction_type"),
        @Index(name = "idx_inv_txn_created_at", columnList = "created_at"),
        @Index(name = "idx_inv_txn_reference",  columnList = "reference_number")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"product", "warehouse"})
public class InventoryTransaction extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private InventoryTransactionType transactionType;

    /** Positive for stock-in, negative for stock-out. Absolute value for adjustments. */
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /** Stock level before this transaction. */
    @Column(name = "quantity_before", nullable = false)
    private Integer quantityBefore;

    /** Stock level after this transaction. */
    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    /** Unit cost at the time of transaction (for valuation). */
    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost;

    /** Total value of this transaction (quantity * unitCost). */
    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;

    /** Reference number for external关联 (e.g., PO number, order number). */
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    /** Reason or notes for this transaction. */
    @Column(name = "reason", length = 500)
    private String reason;

    /** Username of the person who performed this transaction. */
    @Column(name = "performed_by", nullable = false, length = 150)
    private String performedBy;

    /** Timestamp when the transaction was recorded. */
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    /** For transfers: the destination warehouse ID. */
    @Column(name = "destination_warehouse_id")
    private Long destinationWarehouseId;

    /** Batch/lot number for traceability. */
    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    /** Expiry date for perishable items. */
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
}
