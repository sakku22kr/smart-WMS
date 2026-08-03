package com.smartwms.util;

import com.smartwms.security.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for JWT token generation and validation.
 *
 * <p>Uses JJWT 0.12.x API with HMAC-SHA256 signing.
 * Fully usable as a standalone utility — no Spring Security wiring yet.
 * Authentication integration is deferred to Phase 3.</p>
 *
 * <p>All public methods are safe to call from service or filter layers.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtUtil {

    private final JwtConfig jwtConfig;

    // ─── Token Generation ─────────────────────────────────────

    /**
     * Generates an access token for the given subject (username / email).
     */
    public String generateToken(String subject) {
        return buildToken(new HashMap<>(), subject, jwtConfig.getExpiration());
    }

    /**
     * Generates an access token with additional custom claims.
     */
    public String generateToken(Map<String, Object> extraClaims, String subject) {
        return buildToken(extraClaims, subject, jwtConfig.getExpiration());
    }

    /**
     * Generates a long-lived refresh token for the given subject.
     */
    public String generateRefreshToken(String subject) {
        return buildToken(new HashMap<>(), subject, jwtConfig.getRefreshExpiration());
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, Long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // ─── Token Validation ─────────────────────────────────────

    /**
     * Returns {@code true} if the token's subject matches the given username
     * and the token has not expired.
     */
    public boolean isTokenValid(String token, String username) {
        try {
            final String subject = extractSubject(token);
            return subject.equals(username) && !isTokenExpired(token);
        } catch (Exception ex) {
            log.warn("Token validation failed: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Returns {@code true} if the token's expiration date is in the past.
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ─── Claims Extraction ────────────────────────────────────

    /** Extracts the {@code sub} (subject / username) from the token. */
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extracts the token expiration timestamp. */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** Extracts the token issued-at timestamp. */
    public Date extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt);
    }

    /**
     * Generic claim extractor using a resolver function.
     *
     * @param token           raw JWT string
     * @param claimsResolver  function mapping {@link Claims} to the desired value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ─── Internal Helpers ─────────────────────────────────────

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
