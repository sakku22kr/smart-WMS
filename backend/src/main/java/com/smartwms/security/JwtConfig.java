package com.smartwms.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * JWT configuration properties bound from {@code app.jwt.*} in {@code application.yml}.
 *
 * <p>All values must be provided — either through the YAML file or environment variables
 * ({@code JWT_SECRET}, etc.).</p>
 */
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Validated
@Getter
@Setter
public class JwtConfig {

    /**
     * Base64-encoded HMAC-SHA256 signing key.
     * Must be at least 256 bits (32 bytes) long.
     */
    @NotBlank(message = "JWT secret key must not be blank")
    private String secret;

    /**
     * Access token validity in milliseconds. Default: 86400000 (24 hours).
     */
    @Positive(message = "JWT expiration must be positive")
    private Long expiration = 86_400_000L;

    /**
     * Refresh token validity in milliseconds. Default: 604800000 (7 days).
     */
    @Positive(message = "JWT refresh expiration must be positive")
    private Long refreshExpiration = 604_800_000L;
}
