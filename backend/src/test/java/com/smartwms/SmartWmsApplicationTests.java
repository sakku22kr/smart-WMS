package com.smartwms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verifies the Spring application context loads without errors.
 *
 * <p>Uses the {@code test} profile which should configure an in-memory or
 * test-specific datasource (to be added in Phase 5 — Testing).</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class SmartWmsApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the application context starts successfully.
        // No assertions needed — failure is a thrown exception.
    }
}
