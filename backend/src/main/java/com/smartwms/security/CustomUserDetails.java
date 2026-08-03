package com.smartwms.security;

import com.smartwms.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Adapts the application {@link User} entity to Spring Security's {@link UserDetails} interface.
 *
 * <p>This class is the bridge between the persistence layer and Spring Security's
 * authentication / authorization framework. It is instantiated by
 * {@link com.smartwms.service.impl.UserDetailsServiceImpl} and consumed by
 * {@link JwtAuthenticationFilter}.</p>
 *
 * <p>The {@code username} used by Spring Security is the user's {@code email} address,
 * which is the unique login identifier in this system.</p>
 */
@Getter
public class CustomUserDetails implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long   id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String password;
    private final boolean enabled;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final Set<GrantedAuthority> authorities;

    /**
     * Builds a {@code CustomUserDetails} from a fully-loaded {@link User} entity.
     * The user's roles must be initialized before calling this constructor.
     *
     * @param user a non-null, non-deleted user with eagerly-loaded roles
     */
    public CustomUserDetails(User user) {
        this.id                    = user.getId();
        this.email                 = user.getEmail();
        this.firstName             = user.getFirstName();
        this.lastName              = user.getLastName();
        this.password              = user.getPassword();
        this.enabled               = user.isEnabled();
        this.accountNonExpired     = user.isAccountNonExpired();
        this.accountNonLocked      = user.isAccountNonLocked();
        this.credentialsNonExpired = user.isCredentialsNonExpired();

        this.authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toUnmodifiableSet());
    }

    // ─── UserDetails contract ─────────────────────────────────

    /**
     * Returns the email address — used as the principal name throughout Spring Security.
     */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // ─── Convenience Helpers ──────────────────────────────────

    /**
     * Returns the user's full name (first + last).
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Returns {@code true} if the user has the specified role.
     *
     * @param roleName e.g., "ROLE_ADMIN" or "ROLE_WAREHOUSE_MANAGER"
     */
    public boolean hasRole(String roleName) {
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals(roleName));
    }
}
