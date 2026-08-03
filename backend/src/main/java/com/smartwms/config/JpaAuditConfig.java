package com.smartwms.config;

import com.smartwms.constants.AppConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA Auditing configuration.
 *
 * <p>Provides the {@code auditorAware} bean referenced in {@code @EnableJpaAuditing}
 * on the main application class. Returns the current authenticated username, or
 * {@code "system"} if no authentication context is available.</p>
 */
@Configuration
public class JpaAuditConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.of(AppConstants.SYSTEM_USER);
            }
            return Optional.of(auth.getName());
        };
    }
}
