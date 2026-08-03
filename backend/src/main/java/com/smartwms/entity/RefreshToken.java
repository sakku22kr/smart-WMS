package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Stores issued refresh tokens for multi-session / device support.
 *
 * <p>Unlike access tokens (stateless JWTs), refresh tokens are persisted
 * so they can be individually revoked (logout from a device) or bulk-revoked
 * (logout everywhere).</p>
 *
 * <p>A user may hold multiple active refresh tokens — one per client/device session.
 * Use {@link #isValid()} to check if a token can be used to obtain a new access token.</p>
 */
@Entity
@Table(
    name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_refresh_token_token", columnList = "token", unique = true),
        @Index(name = "idx_refresh_token_user",  columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "user")
public class RefreshToken extends BaseEntity {

    /**
     * The opaque token string (UUID-based). Stored as-is — not a JWT.
     */
    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    /**
     * The user this token belongs to.
     * Multiple tokens per user are allowed (multi-device support).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Absolute expiry timestamp. After this point the token is always rejected.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * When set to {@code true}, the token cannot be used regardless of expiry.
     * Set via {@link #revoke()} on logout or credential change.
     */
    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    /**
     * Optional device/agent hint for display in active-sessions management UI.
     */
    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    // ─── Domain Helpers ───────────────────────────────────────

    /**
     * Returns {@code true} if the token has passed its expiry date.
     */
    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Returns {@code true} if the token is not revoked and has not expired.
     * Only valid tokens may be exchanged for new access tokens.
     */
    @Transient
    public boolean isValid() {
        return !revoked && !isExpired();
    }

    /**
     * Marks this token as revoked. Equivalent to logging out from this device.
     */
    public void revoke() {
        this.revoked = true;
    }
}
