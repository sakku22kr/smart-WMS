package com.smartwms.entity;

import com.smartwms.constants.RoleName;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Represents a system role (e.g., ROLE_ADMIN, ROLE_MANAGER).
 * Roles are referenced entities — they are not soft-deleted.
 */
@Entity
@Table(
    name = "roles",
    indexes = {
        @Index(name = "idx_role_name", columnList = "name", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private RoleName name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public Role(RoleName name, String description) {
        this.name = name;
        this.description = description;
    }
}
