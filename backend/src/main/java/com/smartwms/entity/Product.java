package com.smartwms.entity;

import com.smartwms.constants.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

/**
 * Represents a product in the catalog.
 *
 * <p>A product belongs to a {@link Category} and has an optional primary
 * {@link Supplier} and {@link Warehouse}. Stock quantities are tracked directly
 * on this entity for performance; detailed movements will be tracked in a
 * separate InventoryTransaction entity (future phase).</p>
 */
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_product_sku",       columnList = "sku",          unique = true),
        @Index(name = "idx_product_barcode",   columnList = "barcode"),
        @Index(name = "idx_product_category",  columnList = "category_id"),
        @Index(name = "idx_product_supplier",  columnList = "supplier_id"),
        @Index(name = "idx_product_warehouse", columnList = "warehouse_id"),
        @Index(name = "idx_product_status",    columnList = "status")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"category", "supplier", "warehouse"})
public class Product extends SoftDeleteEntity {

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    /**
     * Stock Keeping Unit — unique alphanumeric identifier.
     */
    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    /** Unit of measure: PCS, KG, LTR, BOX, MTR, etc. */
    @Column(name = "unit", nullable = false, length = 20)
    private String unit = "PCS";

    @Column(name = "purchase_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    /** GST/VAT rate as a percentage. */
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    /** Stock quantity at which a reorder should be triggered. */
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    /** Default quantity to order when restocking. */
    @Column(name = "reorder_quantity", nullable = false)
    private Integer reorderQuantity = 0;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;

    /** Stock reserved against pending orders, not yet dispatched. */
    @Column(name = "reserved_stock", nullable = false)
    private Integer reservedStock = 0;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /** Primary/default supplier for this product. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    /** Primary/default storage warehouse. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "notes", length = 1000)
    private String notes;

    // ─── Transient Helpers ────────────────────────────────────

    @Transient
    public int getAvailableStock() {
        return Math.max(0, currentStock - reservedStock);
    }

    @Transient
    public boolean isLowStock() {
        return currentStock > 0 && currentStock <= reorderLevel;
    }

    @Transient
    public boolean isOutOfStock() {
        return currentStock <= 0;
    }
}
