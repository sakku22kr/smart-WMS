package com.smartwms.config;

import com.smartwms.constants.RoleName;
import com.smartwms.entity.Role;
import com.smartwms.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Application data initializer — seeds reference data that must exist before
 * the application can serve any request.
 *
 * <p>Runs automatically on every application startup via {@link CommandLineRunner}.
 * All seed operations are idempotent: a record is only inserted if it does not
 * already exist, so this is safe to run against an already-populated database.</p>
 *
 * <p>Order is {@code LOWEST_PRECEDENCE} to ensure all other beans (JPA, Security)
 * are fully initialized before seeding begins.</p>
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@Order(Integer.MAX_VALUE)
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    /**
     * Human-readable descriptions for each system role.
     * Keyed by {@link RoleName}.
     */
    private static final Map<RoleName, String> ROLE_DESCRIPTIONS = Map.of(
            RoleName.ROLE_ADMIN,
                "System Administrator — unrestricted access to all modules and settings",
            RoleName.ROLE_WAREHOUSE_MANAGER,
                "Warehouse Manager — manages warehouse operations, staff assignments, and receiving",
            RoleName.ROLE_INVENTORY_STAFF,
                "Inventory Staff — can view, update stock levels, and record inventory movements"
    );

    @Override
    @Transactional
    public void run(String... args) {
        log.info("═══ DataInitializer: seeding reference data ═══");
        seedRoles();
        log.info("═══ DataInitializer: reference data seeding complete ═══");
    }

    // ─── Role Seeding ─────────────────────────────────────────

    private void seedRoles() {
        int created = 0;
        for (RoleName roleName : RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(ROLE_DESCRIPTIONS.getOrDefault(roleName, roleName.name()));
                role.setActive(true);
                roleRepository.save(role);
                log.info("  [SEEDED] Role: {}", roleName.name());
                created++;
            } else {
                log.debug("  [EXISTS] Role: {} — skipping", roleName.name());
            }
        }

        if (created == 0) {
            log.info("  All roles already exist — nothing to seed");
        } else {
            log.info("  Seeded {} new role(s)", created);
        }
    }
}
