package com.smartwms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Single-use token for email address verification.
 *
 * <p>Sent to a user's email on registration (or on explicit resend).
 * Tokens expire after 24 hours and are invalidated on successful verification.</p>
 */
@Entity
@Table(
    name = "verification_tokens",
    indexes = {
        @Index(name = "idx_vt_token",   columnList = "token",   unique = true),
        @Index(name = "idx_vt_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "user")
public class VerificationToken extends BaseEntity {

    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Token becomes invalid after this point. Default window: 24 hours. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Set to true immediately after email is successfully verified. */
    @Column(name = "used", nullable = false)
    private boolean used = false;

    // ─── Domain Helpers ───────────────────────────────────────

    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    @Transient
    public boolean isValid() {
        return !used && !isExpired();
    }

    public void markUsed() {
        this.used = true;
    }
}
