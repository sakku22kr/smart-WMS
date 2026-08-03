package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Abstract base entity providing common audit fields for all entities.
 *
 * <p>Provides: {@code id}, {@code version} (optimistic locking),
 * {@code createdAt}, {@code updatedAt}, {@code createdBy}, {@code updatedBy}.</p>
 *
 * <p>All entities must extend this class or {@link SoftDeleteEntity}.</p>
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Optimistic locking version field.
     * Automatically incremented by Hibernate on each update.
     */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 150, updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 150)
    private String updatedBy;
}
