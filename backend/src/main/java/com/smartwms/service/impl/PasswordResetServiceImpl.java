package com.smartwms.service.impl;

import com.smartwms.dto.request.ForgotPasswordRequest;
import com.smartwms.dto.request.ResetPasswordRequest;
import com.smartwms.entity.PasswordResetToken;
import com.smartwms.entity.User;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.repository.PasswordResetTokenRepository;
import com.smartwms.repository.RefreshTokenRepository;
import com.smartwms.repository.UserRepository;
import com.smartwms.service.MailService;
import com.smartwms.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository               userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository       refreshTokenRepository;
    private final MailService                  mailService;
    private final PasswordEncoder              passwordEncoder;

    @Value("${app.mail.password-reset-expiry-minutes:15}")
    private int expiryMinutes;

    // ─── Initiate Password Reset ──────────────────────────────

    @Override
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Lookup user — but NEVER reveal whether the email exists (prevent enumeration)
        userRepository.findByEmail(email).ifPresent(user -> {
            // Delete any existing tokens for this user first
            passwordResetTokenRepository.deleteAllByUser(user);

            // Create new token
            PasswordResetToken token = new PasswordResetToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
            token.setUsed(false);
            passwordResetTokenRepository.save(token);

            // Send email asynchronously (or synchronously here)
            mailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token.getToken());
            log.info("Password reset token issued for user: {}", email);
        });

        // Always return success — even if email not found
        log.debug("Password reset request processed for: {}", email);
    }

    // ─── Reset Password ───────────────────────────────────────

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        // 1. Validate confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Passwords do not match");
        }

        // 2. Find and validate token
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.TOKEN_INVALID,
                        "Invalid or expired password reset link. Please request a new one."));

        if (!resetToken.isValid()) {
            if (resetToken.isExpired()) {
                throw new BusinessException(ErrorCode.TOKEN_EXPIRED,
                        "Password reset link has expired. Please request a new one.");
            }
            throw new BusinessException(ErrorCode.TOKEN_INVALID,
                    "Password reset link has already been used.");
        }

        // 3. Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Invalidate the token (single-use)
        resetToken.markUsed();
        passwordResetTokenRepository.save(resetToken);

        // 5. Revoke ALL refresh tokens — force re-login on all devices
        refreshTokenRepository.revokeAllByUser(user);

        log.info("Password reset successful for user: {} — all sessions revoked", user.getEmail());
    }
}
