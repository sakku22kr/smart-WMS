package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ChangePasswordRequest;
import com.smartwms.dto.request.ProfileRequest;
import com.smartwms.dto.request.UserRequest;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.dto.response.UserSummaryResponse;

import java.util.List;
import java.util.Set;

/**
 * Service contract for User management operations.
 */
public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse getById(Long id);

    UserResponse getByEmail(String email);

    PageResponse<UserResponse> getAll(int page, int size, String sortBy, String sortDir,
                                       String search, Boolean enabled, Long roleId);

    /** Lightweight list for dropdown/select UI. */
    List<UserSummaryResponse> getAllSummaries();

    UserResponse update(Long id, UserRequest request);

    void delete(Long id);

    void toggleStatus(Long id);

    /** Explicitly activate (enable) a user account. */
    UserResponse activate(Long id);

    /** Explicitly deactivate (disable) a user account. */
    UserResponse deactivate(Long id);

    // ─── Profile ─────────────────────────────────────────────

    /** Get the authenticated user's full profile. */
    UserResponse getMyProfile(String email);

    /** Update the authenticated user's profile (name, email, phone). */
    UserResponse updateMyProfile(String email, ProfileRequest request);

    /** Change the authenticated user's password. */
    void changePassword(String email, ChangePasswordRequest request);

    /** Upload/update profile picture for the authenticated user. */
    UserResponse uploadProfilePicture(String email, String imageUrl);

    // ─── Role Management ───────────────────────────────────

    /** Replace all roles on a user with the provided set of role IDs. */
    UserResponse assignRoles(Long userId, Set<Long> roleIds);

    /** Add a single role to a user. */
    UserResponse addRole(Long userId, Long roleId);

    /** Remove a single role from a user. */
    UserResponse removeRole(Long userId, Long roleId);
}
