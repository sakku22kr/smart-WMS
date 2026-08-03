package com.smartwms.service;

import com.smartwms.entity.RefreshToken;
import com.smartwms.entity.User;

/**
 * Contract for refresh-token lifecycle management.
 */
public interface RefreshTokenService {

    /**
     * Creates and persists a new refresh token for the given user.
     *
     * @param user       the authenticated user
     * @param deviceInfo optional browser/device hint for session display
     * @return the saved {@link RefreshToken}
     */
    RefreshToken createRefreshToken(User user, String deviceInfo);

    /**
     * Finds a refresh token by its string value and validates it.
     *
     * @param token the opaque token string
     * @return the valid {@link RefreshToken} entity
     * @throws com.smartwms.exception.BusinessException (TOKEN_INVALID) if not found or revoked
     * @throws com.smartwms.exception.BusinessException (TOKEN_EXPIRED) if past its expiry date
     */
    RefreshToken findAndValidate(String token);

    /**
     * Revokes a single refresh token (logout from one device).
     *
     * @param token the opaque token string to revoke
     */
    void revoke(String token);

    /**
     * Revokes all refresh tokens for a user (logout everywhere / credential change).
     *
     * @param user the user whose tokens should all be invalidated
     */
    void revokeAllUserTokens(User user);

    /**
     * Deletes expired and revoked tokens from the database.
     * Should be scheduled to run periodically.
     */
    void cleanupExpiredTokens();
}
