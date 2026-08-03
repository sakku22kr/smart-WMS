package com.smartwms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response payload returned by the login, register, and refresh-token endpoints.
 *
 * <p>Contains all tokens and user identity information the client needs to:
 * <ul>
 *   <li>Attach the {@code accessToken} as a {@code Bearer} header on subsequent requests.</li>
 *   <li>Use the {@code refreshToken} to obtain a new access token when it expires.</li>
 *   <li>Display user identity in the frontend UI.</li>
 * </ul>
 * </p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    /** JWT access token — attach as {@code Authorization: Bearer <token>}. */
    private String accessToken;

    /**
     * Opaque refresh token — store securely (HttpOnly cookie or secure storage).
     * Exchange this for a new access token via {@code POST /api/v1/auth/refresh-token}.
     */
    private String refreshToken;

    /** Always {@code "Bearer"} — the token type as per OAuth 2.0 convention. */
    @Builder.Default
    private String tokenType = "Bearer";

    /** Number of seconds until the access token expires. */
    private Long expiresIn;

    /** Snapshot of the authenticated user's public profile. */
    private UserResponse user;

    /** Server-side timestamp of when this response was generated. */
    @Builder.Default
    private LocalDateTime issuedAt = LocalDateTime.now();
}
