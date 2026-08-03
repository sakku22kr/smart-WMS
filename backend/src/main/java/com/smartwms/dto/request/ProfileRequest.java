package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request payload for updating the authenticated user's own profile.
 * Does not include password or role fields — those require separate endpoints.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for updating own profile")
public class ProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    @Schema(description = "User's first name", example = "John", minLength = 2, maxLength = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    @Schema(description = "User's last name", example = "Doe", minLength = 2, maxLength = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    @Schema(description = "User's email address (unique)", example = "john.doe@example.com")
    private String email;

    @Pattern(regexp = AppConstants.Patterns.PHONE, message = "Invalid phone number format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Schema(description = "Contact phone number", example = "+91-98765-43210")
    private String phone;
}
