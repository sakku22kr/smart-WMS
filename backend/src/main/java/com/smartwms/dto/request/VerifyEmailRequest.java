package com.smartwms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** Request payload for {@code POST /api/v1/auth/verify-email}. */
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VerifyEmailRequest {

    @NotBlank(message = "Verification token is required")
    private String token;
}
