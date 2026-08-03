package com.smartwms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration allowing the React frontend at {@code localhost:5173}
 * to communicate with this API.
 *
 * <p>All values are externalized to {@code application.yml} under the
 * {@code app.cors.*} prefix and can be overridden via environment variables.</p>
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOriginsRaw;

    @Value("${app.cors.allowed-methods}")
    private String allowedMethodsRaw;

    @Value("${app.cors.max-age}")
    private Long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(Arrays.asList(allowedOriginsRaw.split(",")));
        config.setAllowedMethods(Arrays.asList(allowedMethodsRaw.split(",")));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(maxAge);
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition", "X-Total-Count"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
