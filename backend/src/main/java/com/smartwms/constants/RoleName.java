package com.smartwms.constants;

/**
 * Role names used throughout the application.
 * Prefixed with {@code ROLE_} to comply with Spring Security {@code GrantedAuthority} convention.
 */
public enum RoleName {
    ROLE_ADMIN,
    ROLE_WAREHOUSE_MANAGER,
    ROLE_INVENTORY_STAFF
}
