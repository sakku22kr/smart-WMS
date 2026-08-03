package com.smartwms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload for the {@code POST /api/v1/auth/login} endpoint.
 *
 * <p>The system uses the email address as the unique login identifier.
 * Spring Security's {@code UsernamePasswordAuthenticationToken} will
 * receive this email as the principal.</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    private String password;

    /**
     * Optional device/browser hint stored with the refresh token.
     * Displayed in the "active sessions" management UI.
     * Example: "Chrome on Windows 11"
     */
    @Size(max = 255, message = "Device info must not exceed 255 characters")
    private String deviceInfo;
}
