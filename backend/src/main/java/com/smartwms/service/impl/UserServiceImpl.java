package com.smartwms.service.impl;

import com.smartwms.constants.ActivityType;
import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ChangePasswordRequest;
import com.smartwms.dto.request.ProfileRequest;
import com.smartwms.dto.request.UserRequest;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.dto.response.UserSummaryResponse;
import com.smartwms.entity.Role;
import com.smartwms.entity.User;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.UserMapper;
import com.smartwms.repository.RoleRepository;
import com.smartwms.repository.UserRepository;
import com.smartwms.service.ActivityLogService;
import com.smartwms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Full CRUD implementation for {@link User} entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository    userRepository;
    private final RoleRepository    roleRepository;
    private final UserMapper        userMapper;
    private final PasswordEncoder   passwordEncoder;
    private final ActivityLogService activityLogService;

    // ─── Create ───────────────────────────────────────────────

    @Override
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = userMapper.toEntity(request);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        // Encode password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Resolve and assign roles
        user.setRoles(resolveRoles(request.getRoleIds()));

        User saved = userRepository.save(user);
        activityLogService.log(
            ActivityType.USER_CREATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getFullName(),
            "User account created: " + saved.getEmail(),
            null, null
        );
        log.info("User created: {} (id={})", saved.getEmail(), saved.getId());
        return userMapper.toResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return userMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAll(int page, int size, String sortBy, String sortDir,
                                             String search, Boolean enabled, Long roleId) {
        Sort sort = sortDir.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Specification<User> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            // Search filter
            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("firstName")), keyword),
                    cb.like(cb.lower(root.get("lastName")),  keyword),
                    cb.like(cb.lower(root.get("email")),     keyword),
                    cb.like(cb.lower(root.get("phone")),     keyword)
                ));
            }

            // Status filter
            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }

            // Role filter — join through the roles collection
            if (roleId != null) {
                var rolesJoin = root.join("roles");
                predicates.add(cb.equal(rolesJoin.get("id"), roleId));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        Page<UserResponse> responsePage = userPage.map(userMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllSummaries() {
        return userRepository.findAll().stream()
                .map(userMapper::toSummaryResponse)
                .toList();
    }

    // ─── Update ───────────────────────────────────────────────

    @Override
    public UserResponse update(Long id, UserRequest request) {
        User user = findById(id);

        if (userRepository.existsByEmailAndIdNot(request.getEmail().trim().toLowerCase(), id)) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        userMapper.updateEntityFromRequest(request, user);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        // Only encode and set password if provided (partial update support)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update roles if provided
        if (request.getRoleIds() != null) {
            user.setRoles(resolveRoles(request.getRoleIds()));
        }

        User saved = userRepository.save(user);
        log.info("User updated: {} (id={})", saved.getEmail(), saved.getId());
        return userMapper.toResponse(saved);
    }

    // ─── Delete ───────────────────────────────────────────────

    @Override
    public void delete(Long id) {
        User user = findById(id);
        String name = user.getFullName();
        String email = user.getEmail();
        user.softDelete("system");
        userRepository.save(user);
        activityLogService.log(
            ActivityType.USER_DELETED, null, AppConstants.SYSTEM_USER, "System",
            id, name,
            "User account soft-deleted: " + email,
            null, null
        );
        log.info("User soft-deleted: {}", id);
    }

    // ─── Toggle Status ────────────────────────────────────────

    @Override
    public void toggleStatus(Long id) {
        User user = findById(id);
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        log.info("User status toggled: {} (enabled={})", id, user.isEnabled());
    }

    @Override
    public UserResponse activate(Long id) {
        User user = findById(id);
        if (user.isEnabled()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "User is already active");
        }
        user.setEnabled(true);
        User saved = userRepository.save(user);
        activityLogService.log(
            ActivityType.USER_ACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getFullName(),
            "User account activated: " + saved.getEmail(),
            null, null
        );
        log.info("User activated: {} (id={})", saved.getEmail(), id);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse deactivate(Long id) {
        User user = findById(id);
        if (!user.isEnabled()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "User is already inactive");
        }
        user.setEnabled(false);
        User saved = userRepository.save(user);
        activityLogService.log(
            ActivityType.USER_DEACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getFullName(),
            "User account deactivated: " + saved.getEmail(),
            null, null
        );
        log.info("User deactivated: {} (id={})", saved.getEmail(), id);
        return userMapper.toResponse(saved);
    }

    // ─── Private Helpers ──────────────────────────────────────

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Set<Role> resolveRoles(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<Role> roles = new HashSet<>();
        for (Long roleId : roleIds) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
            roles.add(role);
        }
        return roles;
    }

    // ─── Profile ─────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile(String email) {
        User user = findByEmail(email);
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateMyProfile(String email, ProfileRequest request) {
        User user = findByEmail(email);

        // Check email uniqueness if changed
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equals(user.getEmail())
                && userRepository.existsByEmailAndIdNot(newEmail, user.getId())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(newEmail);
        user.setPhone(request.getPhone());

        User saved = userRepository.save(user);
        log.info("Profile updated for user: {}", saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Current password is incorrect");
        }

        // Confirm new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        activityLogService.log(
            ActivityType.USER_PASSWORD_CHANGED, user.getId(), email, user.getFullName(),
            user.getId(), user.getFullName(),
            "Password changed for user: " + email,
            null, null
        );
        log.info("Password changed for user: {}", email);
    }

    @Override
    public UserResponse uploadProfilePicture(String email, String imageUrl) {
        User user = findByEmail(email);
        user.setProfileImageUrl(imageUrl);
        User saved = userRepository.save(user);
        log.info("Profile picture updated for user: {}", email);
        return userMapper.toResponse(saved);
    }

    // ─── Role Management ───────────────────────────────────

    @Override
    public UserResponse assignRoles(Long userId, Set<Long> roleIds) {
        User user = findById(userId);
        Set<Role> roles = resolveRoles(roleIds);
        user.setRoles(roles);
        User saved = userRepository.save(user);
        log.info("Roles assigned to user {}: {} role IDs", userId, roleIds);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse addRole(Long userId, Long roleId) {
        User user = findById(userId);

        // Check role exists
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        // Validate not already assigned
        if (user.getRoles().contains(role)) {
            throw new BusinessException(
                ErrorCode.VALIDATION_FAILED,
                "Role '" + role.getName() + "' is already assigned to this user"
            );
        }

        user.getRoles().add(role);
        User saved = userRepository.save(user);
        log.info("Role {} added to user {}", roleId, userId);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse removeRole(Long userId, Long roleId) {
        User user = findById(userId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        // Validate role is assigned
        if (!user.getRoles().contains(role)) {
            throw new BusinessException(
                ErrorCode.VALIDATION_FAILED,
                "Role '" + role.getName() + "' is not assigned to this user"
            );
        }

        // Prevent removing the last role
        if (user.getRoles().size() <= 1) {
            throw new BusinessException(
                ErrorCode.VALIDATION_FAILED,
                "Cannot remove the last role. A user must have at least one role."
            );
        }

        user.getRoles().remove(role);
        User saved = userRepository.save(user);
        log.info("Role {} removed from user {}", roleId, userId);
        return userMapper.toResponse(saved);
    }
}
