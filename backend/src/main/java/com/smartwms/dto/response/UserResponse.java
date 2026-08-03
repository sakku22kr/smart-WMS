package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Full user profile response, including assigned roles.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full user profile response")
public class UserResponse {

    @Schema(description = "Unique user identifier", example = "1")
    private Long   id;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "Full name (first + last)", example = "John Doe")
    private String fullName;

    @Schema(description = "Email address (unique)", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Contact phone number", example = "+91-98765-43210")
    private String phone;

    @Schema(description = "Profile image URL")
    private String profileImageUrl;

    @Schema(description = "Whether the account is enabled", example = "true")
    private boolean enabled;

    @Schema(description = "Assigned roles")
    private Set<RoleResponse> roles;

    @Schema(description = "Account creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Username who created this record")
    private String createdBy;

    @Schema(description = "Username who last updated this record")
    private String updatedBy;
}
