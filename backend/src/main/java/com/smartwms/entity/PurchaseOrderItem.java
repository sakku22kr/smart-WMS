package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * A line item within a purchase order.
 */
@Entity
@Table(
    name = "purchase_order_items",
    indexes = {
        @Index(name = "idx_po_item_order",  columnList = "purchase_order_id"),
        @Index(name = "idx_po_item_product", columnList = "product_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"purchaseOrder", "product"})
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false, length = 300)
    private String productName;

    @Column(name = "product_sku", length = 50)
    private String productSku;

    @Column(name = "ordered_quantity", nullable = false)
    private Integer orderedQuantity;

    @Column(name = "received_quantity", nullable = false)
    private Integer receivedQuantity = 0;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // ─── Transient Helpers ────────────────────────────────────

    @Transient
    public boolean isFullyReceived() {
        return receivedQuantity != null && orderedQuantity != null && receivedQuantity >= orderedQuantity;
    }

    @Transient
    public int getPendingQuantity() {
        return Math.max(0, (orderedQuantity != null ? orderedQuantity : 0) - (receivedQuantity != null ? receivedQuantity : 0));
    }

    // ─── Business Helpers ─────────────────────────────────────

    public void calculateLineTotal() {
        BigDecimal base = unitPrice.multiply(BigDecimal.valueOf(orderedQuantity != null ? orderedQuantity : 0));
        BigDecimal afterDiscount = base.subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
        this.taxAmount = afterDiscount.multiply(taxRate != null ? taxRate.divide(BigDecimal.valueOf(100)) : BigDecimal.ZERO);
        this.lineTotal = afterDiscount.add(taxAmount);
    }
}
