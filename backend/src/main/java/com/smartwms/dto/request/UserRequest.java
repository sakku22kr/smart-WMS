package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

/**
 * Request payload for creating or updating a User.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating or updating a user")
public class UserRequest {

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

    /**
     * Required on create; ignored (null) on update if not provided.
     * Service layer handles partial update logic.
     */
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    )
    @Schema(description = "User password (required on create, optional on update)", example = "Secure@123")
    private String password;

    @Pattern(regexp = AppConstants.Patterns.PHONE, message = "Invalid phone number format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Schema(description = "Contact phone number", example = "+91-98765-43210")
    private String phone;

    /** IDs of roles to assign. Must reference existing role records. */
    @Schema(description = "Set of role IDs to assign to the user", example = "[1, 2]")
    private Set<Long> roleIds;

    @Builder.Default
    @Schema(description = "Whether the user account is enabled", example = "true", defaultValue = "true")
    private boolean enabled = true;
}
