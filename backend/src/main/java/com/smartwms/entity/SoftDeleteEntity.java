package com.smartwms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Abstract entity providing soft-delete capability.
 *
 * <p>Instead of physically deleting records, entities extending this class
 * set {@code deleted = true}. The {@code @SQLRestriction} annotation is applied
 * on each concrete entity class (not here) because Hibernate 6 does not
 * propagate it from {@code @MappedSuperclass} to subclasses.</p>
 *
 * <p>Use {@link #softDelete(String)} to mark a record as deleted.</p>
 */
@MappedSuperclass
@Getter
@Setter
public abstract class SoftDeleteEntity extends BaseEntity {

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 150)
    private String deletedBy;

    /**
     * Marks this entity as soft-deleted.
     *
     * @param deletedBy the username of the actor performing the deletion
     */
    public void softDelete(String deletedBy) {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
    }

    /**
     * Restores a previously soft-deleted entity.
     */
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
    }
}
