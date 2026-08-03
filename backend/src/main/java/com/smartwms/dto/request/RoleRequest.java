package com.smartwms.dto.request;

import com.smartwms.constants.RoleName;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request payload for creating or updating a Role.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {

    @NotNull(message = "Role name is required")
    private RoleName name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Builder.Default
    private boolean active = true;
}
