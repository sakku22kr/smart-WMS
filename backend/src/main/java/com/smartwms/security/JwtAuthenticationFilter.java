package com.smartwms.security;

import com.smartwms.constants.AppConstants;
import com.smartwms.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter — executed once per request.
 *
 * <p>Intercepts every HTTP request and performs the following steps:</p>
 * <ol>
 *   <li>Extracts the {@code Authorization: Bearer <token>} header.</li>
 *   <li>Parses the JWT and extracts the subject (email).</li>
 *   <li>Loads the user via {@link UserDetailsService} if no authentication exists yet.</li>
 *   <li>Validates the token signature, expiry, and subject match.</li>
 *   <li>Sets a {@link UsernamePasswordAuthenticationToken} in the
 *       {@link SecurityContextHolder} so downstream handlers see the user as authenticated.</li>
 * </ol>
 *
 * <p>Any JWT error (expired, malformed, invalid signature) is caught and logged
 * at WARN level. The filter continues the chain without authentication — letting
 * Spring Security's access control deny the request if the endpoint requires auth.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil           jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(AppConstants.AUTHORIZATION_HEADER);

        // ── 1. Skip if no Bearer token present ───────────────
        if (authHeader == null || !authHeader.startsWith(AppConstants.BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(AppConstants.BEARER_PREFIX.length()).trim();

        try {
            // ── 2. Extract the subject (email) from the JWT ──
            final String userEmail = jwtUtil.extractSubject(jwt);

            // ── 3. Only authenticate if not already authenticated ──
            if (userEmail != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                // ── 4. Load user from database ────────────────
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // ── 5. Validate token against loaded user ─────
                if (jwtUtil.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,                       // credentials cleared post-auth
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // ── 6. Publish to SecurityContext ─────────
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authenticated user '{}' via JWT for [{}] {}",
                            userEmail, request.getMethod(), request.getRequestURI());
                } else {
                    log.warn("JWT validation failed for user '{}' — token rejected", userEmail);
                }
            }
        } catch (ExpiredJwtException ex) {
            log.warn("JWT expired for request [{}]: {}", request.getRequestURI(), ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT in request [{}]: {}", request.getRequestURI(), ex.getMessage());
        } catch (SignatureException ex) {
            log.warn("JWT signature invalid for request [{}]: {}", request.getRequestURI(), ex.getMessage());
        } catch (Exception ex) {
            log.warn("JWT processing error for [{}]: {}", request.getRequestURI(), ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Skips JWT processing for public auth endpoints to avoid pointless DB lookups.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/actuator/health")
                || path.equals("/actuator/info")
                || path.equals("/error");
    }
}
