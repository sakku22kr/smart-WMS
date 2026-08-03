package com.smartwms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/** Request payload for {@code POST /api/v1/auth/reset-password}. */
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    @Pattern(
        regexp  = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    )
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
}
