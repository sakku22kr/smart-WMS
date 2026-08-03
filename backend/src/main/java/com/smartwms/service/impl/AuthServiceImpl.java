package com.smartwms.service.impl;

import com.smartwms.constants.RoleName;
import com.smartwms.dto.request.LoginRequest;
import com.smartwms.dto.request.RefreshTokenRequest;
import com.smartwms.dto.request.RegisterRequest;
import com.smartwms.dto.response.AuthResponse;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.entity.RefreshToken;
import com.smartwms.entity.Role;
import com.smartwms.entity.User;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.UserMapper;
import com.smartwms.repository.RoleRepository;
import com.smartwms.repository.UserRepository;
import com.smartwms.security.CustomUserDetails;
import com.smartwms.security.JwtConfig;
import com.smartwms.service.AuthService;
import com.smartwms.service.RefreshTokenService;
import com.smartwms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core authentication service — handles login, registration, token refresh, and logout.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository        userRepository;
    private final RoleRepository        roleRepository;
    private final RefreshTokenService   refreshTokenService;
    private final UserMapper            userMapper;
    private final JwtUtil               jwtUtil;
    private final JwtConfig             jwtConfig;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // ─── Login ────────────────────────────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        // 1. Delegate to Spring Security's authentication pipeline
        //    (DaoAuthenticationProvider → UserDetailsServiceImpl → BCrypt verify)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();

        // 2. Load the full User entity (needed for refresh token relationship)
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        // 3. Generate tokens
        String       accessToken  = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, request.getDeviceInfo());

        log.info("User logged in successfully: {}", user.getEmail());
        return buildAuthResponse(accessToken, refreshToken.getToken(), user);
    }

    // ─── Register ─────────────────────────────────────────────

    @Override
    public AuthResponse register(RegisterRequest request) {
        // 1. Validate confirm password
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Passwords do not match");
        }

        // 2. Check email uniqueness
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        // 3. Resolve default role
        Role defaultRole = roleRepository.findByName(RoleName.ROLE_INVENTORY_STAFF)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        "Default role ROLE_INVENTORY_STAFF not found. Ensure DataInitializer has run."));

        // 4. Build and persist the new User
        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        user.getRoles().add(defaultRole);

        user = userRepository.save(user);

        // 5. Generate tokens
        String       accessToken  = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, null);

        log.info("New user registered: {} (id={})", user.getEmail(), user.getId());
        return buildAuthResponse(accessToken, refreshToken.getToken(), user);
    }

    // ─── Refresh Token ────────────────────────────────────────

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // 1. Validate old refresh token
        RefreshToken existingToken = refreshTokenService.findAndValidate(request.getRefreshToken());
        User user = existingToken.getUser();

        // 2. Rotate: revoke old, issue new
        String deviceInfo = existingToken.getDeviceInfo();
        refreshTokenService.revoke(existingToken.getToken());

        // 3. Generate new access + refresh tokens
        String       newAccessToken  = jwtUtil.generateToken(user.getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, deviceInfo);

        log.debug("Token refreshed for user: {}", user.getEmail());
        return buildAuthResponse(newAccessToken, newRefreshToken.getToken(), user);
    }

    // ─── Logout ───────────────────────────────────────────────

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
        log.debug("Logout completed — refresh token revoked");
    }

    // ─── Private Helpers ──────────────────────────────────────

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        UserResponse userResponse = userMapper.toResponse(user);
        long expiresIn = jwtConfig.getExpiration() / 1000L; // ms → seconds

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(userResponse)
                .build();
    }
}
