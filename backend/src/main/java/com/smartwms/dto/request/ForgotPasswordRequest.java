package com.smartwms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/** Request payload for {@code POST /api/v1/auth/forgot-password}. */
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150)
    private String email;
}
