package com.smartwms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Smart Inventory & Warehouse Management System — Backend Application.
 *
 * <p>Entry point for the Spring Boot application. Enables JPA auditing
 * for automatic population of {@code createdAt}, {@code updatedAt},
 * {@code createdBy}, and {@code updatedBy} fields.</p>
 */
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class SmartWmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWmsApplication.class, args);
    }
}
