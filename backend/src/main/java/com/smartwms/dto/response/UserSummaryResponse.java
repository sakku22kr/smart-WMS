package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Set;

/**
 * Lightweight user summary — used as a nested reference or for dropdown/select UIs.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Lightweight user summary for dropdowns and select UIs")
public class UserSummaryResponse {

    @Schema(description = "Unique user identifier", example = "1")
    private Long   id;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "Full name (first + last)", example = "John Doe")
    private String fullName;

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Whether the account is enabled", example = "true")
    private boolean enabled;

    @Schema(description = "Assigned roles")
    private Set<RoleResponse> roles;
}
