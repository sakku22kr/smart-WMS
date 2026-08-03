package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ChangePasswordRequest;
import com.smartwms.dto.request.ProfileRequest;
import com.smartwms.dto.request.UserRequest;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.dto.response.UserSummaryResponse;
import com.smartwms.exception.ErrorCode;
import com.smartwms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for User CRUD operations.
 *
 * <p>Base path: {@code /api/v1/users}</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create User", description = "Creates a new user account with the specified roles.")
    public ResponseEntity<ApiResponse<UserResponse>> create(
            @Valid @RequestBody UserRequest request) {
        log.info("POST /users — email={}", request.getEmail());
        UserResponse response = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get User by ID", description = "Retrieves a single user by their unique identifier.")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get User by Email", description = "Retrieves a single user by their email address.")
    public ResponseEntity<ApiResponse<UserResponse>> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.success(userService.getByEmail(email)));
    }

    @GetMapping
    @Operation(summary = "List Users", description = "Paginated, sortable list with optional keyword search, status filter, and role filter.")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAll(
            @RequestParam(defaultValue = "0")    int       page,
            @RequestParam(defaultValue = "25")   int       size,
            @RequestParam(defaultValue = "id")   String    sortBy,
            @RequestParam(defaultValue = "asc")  String    sortDir,
            @RequestParam(required = false)      String    search,
            @RequestParam(required = false)      Boolean   enabled,
            @RequestParam(required = false)      Long      roleId) {
        PageResponse<UserResponse> data = userService.getAll(page, size, sortBy, sortDir, search, enabled, roleId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/summaries")
    @Operation(summary = "Get All User Summaries", description = "Lightweight list for dropdown/select UI.")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getSummaries() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllSummaries()));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update User", description = "Updates user details. Password is only changed if provided.")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        log.info("PUT /users/{}", id);
        UserResponse response = userService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Delete ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete User", description = "Soft-deletes the user. The record is preserved but excluded from queries.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        log.info("DELETE /users/{}", id);
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    // ─── Toggle Status ────────────────────────────────────────

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle User Status", description = "Toggles the enabled/disabled status of a user account.")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        log.info("PATCH /users/{}/toggle-status", id);
        userService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully"));
    }

    // ─── Activate / Deactivate ─────────────────────────────

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate User", description = "Explicitly enables a user account.")
    public ResponseEntity<ApiResponse<UserResponse>> activate(@PathVariable Long id) {
        log.info("PATCH /users/{}/activate", id);
        UserResponse response = userService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate User", description = "Explicitly disables a user account.")
    public ResponseEntity<ApiResponse<UserResponse>> deactivate(@PathVariable Long id) {
        log.info("PATCH /users/{}/deactivate", id);
        UserResponse response = userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", response));
    }

    // ─── Profile (Self) ──────────────────────────────────────

    @GetMapping("/me")
    @Operation(summary = "Get My Profile", description = "Returns the full profile of the currently authenticated user.")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyProfile(userDetails.getUsername())));
    }

    @PutMapping("/me")
    @Operation(summary = "Update My Profile", description = "Updates the currently authenticated user's name, email, and phone.")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfileRequest request) {
        log.info("PUT /users/me — email={}", userDetails.getUsername());
        UserResponse response = userService.updateMyProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    @PatchMapping(value = "/me/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Profile Picture", description = "Uploads or replaces the authenticated user's profile picture.")
    public ResponseEntity<ApiResponse<?>> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed", ErrorCode.BAD_REQUEST.getCode()));
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size must not exceed 5MB", ErrorCode.BAD_REQUEST.getCode()));
        }

        // Generate unique filename
        String extension = "";
        if (contentType.contains("png"))       extension = ".png";
        else if (contentType.contains("jpeg")) extension = ".jpg";
        else if (contentType.contains("gif"))  extension = ".gif";
        else if (contentType.contains("webp")) extension = ".webp";

        String filename = "profile-" + UUID.randomUUID() + extension;

        // Save to upload directory
        Path uploadDir = Paths.get("uploads/profile-pictures");
        Files.createDirectories(uploadDir);
        Path filePath = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Build the accessible URL
        String imageUrl = "/uploads/profile-pictures/" + filename;

        log.info("Profile picture uploaded: {} → {}", userDetails.getUsername(), filename);
        UserResponse response = userService.uploadProfilePicture(userDetails.getUsername(), imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Profile picture uploaded successfully", response));
    }

    @PatchMapping("/me/change-password")
    @Operation(summary = "Change My Password", description = "Changes the authenticated user's password after verifying the current password.")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("PATCH /users/me/change-password — user={}", userDetails.getUsername());
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
