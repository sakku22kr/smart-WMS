package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a system user with role-based access control.
 *
 * <p>Soft-deleted users are automatically excluded from all queries via
 * {@code @SQLRestriction("deleted = false")}.</p>
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true)
    }
)
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"password", "roles"})
public class User extends SoftDeleteEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "profile_image_url", length = 512)
    private String profileImageUrl;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;

    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired = true;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    /**
     * Convenience method — returns first + last name.
     */
    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
