package com.smartwms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request payload for the {@code POST /api/v1/auth/refresh-token} endpoint.
 *
 * <p>The client sends this request when its access token has expired.
 * The server validates the refresh token, verifies it has not been revoked
 * or expired, and issues a new access token (and optionally rotates the
 * refresh token for security).</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
