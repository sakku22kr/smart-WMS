package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * Minimal role summary — used as a nested response inside UserResponse.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Role summary response")
public class RoleResponse {

    @Schema(description = "Unique role identifier", example = "1")
    private Long   id;

    @Schema(description = "Role name (Spring Security convention)", example = "ROLE_ADMIN")
    private String name;

    @Schema(description = "Human-readable role description", example = "Full system administrator")
    private String description;

    @Schema(description = "Whether the role is active", example = "true")
    private boolean active;
}
