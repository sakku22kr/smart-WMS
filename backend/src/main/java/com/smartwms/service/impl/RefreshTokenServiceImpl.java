package com.smartwms.service.impl;

import com.smartwms.entity.RefreshToken;
import com.smartwms.entity.User;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.repository.RefreshTokenRepository;
import com.smartwms.security.JwtConfig;
import com.smartwms.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Manages the lifecycle of opaque refresh tokens stored in the database.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtConfig              jwtConfig;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user, String deviceInfo) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setDeviceInfo(deviceInfo);
        refreshToken.setRevoked(false);

        // Convert milliseconds to seconds, then to a future LocalDateTime
        long expirySeconds = jwtConfig.getRefreshExpiration() / 1000L;
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(expirySeconds));

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.debug("Created refresh token for user [{}], expires at {}", user.getEmail(), saved.getExpiresAt());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken findAndValidate(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Refresh token not found in database");
                    return new BusinessException(ErrorCode.TOKEN_INVALID, "Invalid refresh token");
                });

        if (refreshToken.isRevoked()) {
            log.warn("Attempted use of revoked refresh token for user [{}]",
                    refreshToken.getUser().getEmail());
            throw new BusinessException(ErrorCode.TOKEN_INVALID, "Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            log.warn("Attempted use of expired refresh token for user [{}]",
                    refreshToken.getUser().getEmail());
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, "Refresh token has expired. Please log in again.");
        }

        return refreshToken;
    }

    @Override
    @Transactional
    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresentOrElse(rt -> {
            rt.revoke();
            refreshTokenRepository.save(rt);
            log.debug("Revoked refresh token for user [{}]", rt.getUser().getEmail());
        }, () -> log.debug("Revoke called on non-existent token — ignoring"));
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(User user) {
        int count = refreshTokenRepository.revokeAllByUser(user);
        log.info("Revoked {} refresh token(s) for user [{}]", count, user.getEmail());
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredAndRevokedTokens(LocalDateTime.now());
        log.info("Refresh token cleanup: deleted {} expired/revoked token(s)", deleted);
    }
}
