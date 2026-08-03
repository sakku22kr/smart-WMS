package com.smartwms.service;

import com.smartwms.dto.request.LoginRequest;
import com.smartwms.dto.request.RefreshTokenRequest;
import com.smartwms.dto.request.RegisterRequest;
import com.smartwms.dto.response.AuthResponse;

/**
 * Contract for all authentication operations.
 */
public interface AuthService {

    /**
     * Authenticates a user with email and password.
     * Issues a JWT access token and a refresh token on success.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Registers a new user account and immediately logs them in.
     * Assigns the default role ({@code ROLE_INVENTORY_STAFF}).
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Exchanges a valid refresh token for a new access token (with rotation).
     */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /**
     * Revokes the given refresh token — logs out the device session.
     */
    void logout(String refreshToken);
}
