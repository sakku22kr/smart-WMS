package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Single-use token for password reset flows.
 *
 * <p>Tokens expire after 15 minutes and are invalidated immediately on use.
 * Only one active token per user is enforced in the service layer.</p>
 */
@Entity
@Table(
    name = "password_reset_tokens",
    indexes = {
        @Index(name = "idx_prt_token",   columnList = "token",   unique = true),
        @Index(name = "idx_prt_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "user")
public class PasswordResetToken extends BaseEntity {

    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Token becomes invalid after this point. Default window: 15 minutes. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Set to true immediately after password is successfully reset. */
    @Column(name = "used", nullable = false)
    private boolean used = false;

    // ─── Domain Helpers ───────────────────────────────────────

    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /** Returns true only if the token has not been used AND has not expired. */
    @Transient
    public boolean isValid() {
        return !used && !isExpired();
    }

    /** Marks the token as consumed — prevents replay attacks. */
    public void markUsed() {
        this.used = true;
    }
}
