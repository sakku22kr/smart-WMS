package com.smartwms.entity;

import com.smartwms.constants.CategoryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a product category with optional hierarchical parent-child structure.
 *
 * <p>A category without a parent is a root category.
 * Categories can be nested to arbitrary depth.</p>
 */
@Entity
@Table(
    name = "categories",
    indexes = {
        @Index(name = "idx_category_code", columnList = "code", unique = true),
        @Index(name = "idx_category_parent", columnList = "parent_id"),
        @Index(name = "idx_category_status", columnList = "status")
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"parent", "children"})
public class Category extends SoftDeleteEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    /** Display ordering within the same parent group. */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CategoryStatus status = CategoryStatus.ACTIVE;

    /** Parent category — null if this is a root category. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    /** Direct children of this category. */
    @OneToMany(mappedBy = "parent", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private List<Category> children = new ArrayList<>();

    @Transient
    public boolean isRoot() {
        return parent == null;
    }
}
