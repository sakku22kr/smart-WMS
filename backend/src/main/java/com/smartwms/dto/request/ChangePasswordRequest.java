package com.smartwms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload for changing the authenticated user's password.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for changing own password")
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    @Schema(description = "Current password for verification", example = "OldPass@123")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    )
    @Schema(description = "New password", example = "NewSecure@123")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    @Schema(description = "Confirm new password", example = "NewSecure@123")
    private String confirmPassword;
}
