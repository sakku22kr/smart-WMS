package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import com.smartwms.validation.UniqueEmail;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request payload for the {@code POST /api/v1/auth/register} endpoint.
 *
 * <p>Distinct from {@link UserRequest} (admin user management) — this DTO is
 * specifically for self-registration. Role assignment is handled automatically
 * by the auth service (default: ROLE_INVENTORY_STAFF).</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    /**
     * Email is used as the unique login identifier.
     * The {@code @UniqueEmail} constraint performs a database lookup to ensure
     * no existing user is registered with this address.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    @UniqueEmail
    private String email;

    /**
     * Raw password — will be BCrypt-encoded before persistence.
     * Never returned in any response DTO.
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    )
    private String password;

    /**
     * Must match {@code password} exactly.
     * Business-logic equality check is performed in the auth service.
     */
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    @Pattern(regexp = AppConstants.Patterns.PHONE, message = "Invalid phone number format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;
}
