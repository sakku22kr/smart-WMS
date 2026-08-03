package com.smartwms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security 6 configuration — stateless JWT-based REST API.
 *
 * <p>Security model:</p>
 * <ul>
 *   <li>JWT filter is fully wired — validates every request before it reaches controllers.</li>
 *   <li>BCrypt password encoder (strength 12) is configured.</li>
 *   <li>DAO authentication provider delegates to {@link UserDetailsServiceImpl}.</li>
 *   <li>All non-public endpoints require a valid JWT ({@code .anyRequest().authenticated()}).</li>
 *   <li>Public endpoints (auth/*, swagger, actuator/health) are explicitly whitelisted.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService       userDetailsService;
    private final CorsConfigurationSource  corsConfigurationSource;

    /** Public endpoints — never require a JWT token. */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/actuator/health",
            "/actuator/info",
            "/error"
    };

    // ─── Security Filter Chain ────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── Stateless REST: disable CSRF ──
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS from CorsConfig bean ──
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // ── No server-side sessions — JWT is the session ──
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Register DAO auth provider ──
            .authenticationProvider(authenticationProvider())

            // ── Authorization rules ──
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                    .anyRequest().authenticated()
            )

            // ── JWT filter before Spring's username/password filter ──
            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─── Authentication Infrastructure ───────────────────────

    /**
     * DAO-based authentication provider.
     *
     * <p>Connects Spring Security's authentication pipeline to the application's
     * {@link UserDetailsService} and {@link PasswordEncoder}.
     * Used by the {@link AuthenticationManager} when processing login credentials.</p>
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * BCrypt password encoder — strength factor 12 (production-safe, ~250ms per hash).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Exposes the {@link AuthenticationManager} as a Spring bean.
     * Required by the auth service to programmatically authenticate credentials
     * (login flow — Phase 3.2).
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
