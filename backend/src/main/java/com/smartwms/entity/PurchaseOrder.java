package com.smartwms.entity;

import com.smartwms.constants.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a purchase order to a supplier for procuring products.
 */
@Entity
@Table(
    name = "purchase_orders",
    indexes = {
        @Index(name = "idx_po_order_number", columnList = "order_number", unique = true),
        @Index(name = "idx_po_supplier",     columnList = "supplier_id"),
        @Index(name = "idx_po_warehouse",    columnList = "warehouse_id"),
        @Index(name = "idx_po_status",       columnList = "status"),
        @Index(name = "idx_po_order_date",   columnList = "order_date"),
        @Index(name = "idx_po_expected",     columnList = "expected_delivery_date")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"supplier", "warehouse", "items"})
public class PurchaseOrder extends SoftDeleteEntity {

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate = LocalDate.now();

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;

    @Column(name = "subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_cost", precision = 15, scale = 2)
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "currency", length = 10)
    private String currency = "INR";

    @Column(name = "payment_terms", length = 200)
    private String paymentTerms;

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "internal_notes", length = 1000)
    private String internalNotes;

    @Column(name = "inventory_adjusted", nullable = false)
    private Boolean inventoryAdjusted = false;

    @Column(name = "approved_by", length = 150)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "received_by", length = 150)
    private String receivedBy;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "rejected_by", length = 150)
    private String rejectedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "cancelled_by", length = 150)
    private String cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("changedAt ASC")
    private List<PurchaseOrderStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<PurchaseOrderItem> items = new ArrayList<>();

    // ─── Transient Helpers ────────────────────────────────────

    @Transient
    public int getTotalItemCount() {
        return items.stream().mapToInt(PurchaseOrderItem::getOrderedQuantity).sum();
    }

    @Transient
    public int getReceivedItemCount() {
        return items.stream().mapToInt(PurchaseOrderItem::getReceivedQuantity).sum();
    }

    @Transient
    public boolean isFullyReceived() {
        return !items.isEmpty() && items.stream().allMatch(PurchaseOrderItem::isFullyReceived);
    }

    // ─── Business Helpers ─────────────────────────────────────

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(PurchaseOrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalAmount = subtotal.add(taxAmount).add(shippingCost).subtract(discountAmount);
    }

    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }

    public void removeItem(PurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }

    public void addStatusHistory(PurchaseOrderStatusHistory history) {
        statusHistory.add(history);
        history.setPurchaseOrder(this);
    }
}
