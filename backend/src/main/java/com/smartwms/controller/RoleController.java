package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.response.RoleResponse;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.service.RoleService;
import com.smartwms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST controller for Role management operations.
 *
 * <p>Base path: {@code /api/v1/roles}</p>
 * <p>All endpoints require {@code ROLE_ADMIN} authorization.</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/roles")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Roles", description = "Role management endpoints (Admin only)")
public class RoleController {

    private final RoleService roleService;
    private final UserService userService;

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List All Active Roles", description = "Returns all active roles in the system.")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllActive() {
        log.info("GET /roles — list all active");
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Role by ID", description = "Retrieves a single role by its unique identifier.")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable Long id) {
        log.info("GET /roles/{}", id);
        return ResponseEntity.ok(ApiResponse.success(roleService.getById(id)));
    }

    // ─── Assign / Add / Remove Roles on a User ────────────────

    @PutMapping("/user/{userId}")
    @Operation(
        summary = "Replace User Roles",
        description = "Replaces all roles on a user with the provided set of role IDs."
    )
    public ResponseEntity<ApiResponse<UserResponse>> assignRoles(
            @PathVariable Long userId,
            @RequestBody Set<Long> roleIds) {
        log.info("PUT /roles/user/{} — assign {} roles", userId, roleIds.size());
        UserResponse response = userService.assignRoles(userId, roleIds);
        return ResponseEntity.ok(ApiResponse.success("Roles updated successfully", response));
    }

    @PostMapping("/user/{userId}/role/{roleId}")
    @Operation(
        summary = "Add Role to User",
        description = "Adds a single role to the user. Fails if the role is already assigned."
    )
    public ResponseEntity<ApiResponse<UserResponse>> addRole(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        log.info("POST /roles/user/{}/role/{} — add role", userId, roleId);
        UserResponse response = userService.addRole(userId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Role added successfully", response));
    }

    @DeleteMapping("/user/{userId}/role/{roleId}")
    @Operation(
        summary = "Remove Role from User",
        description = "Removes a single role from the user. Fails if the role is not assigned or is the last role."
    )
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        log.info("DELETE /roles/user/{}/role/{} — remove role", userId, roleId);
        UserResponse response = userService.removeRole(userId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", response));
    }
}
