package com.smartwms.service.impl;

import com.smartwms.dto.request.VerifyEmailRequest;
import com.smartwms.entity.User;
import com.smartwms.entity.VerificationToken;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.repository.UserRepository;
import com.smartwms.repository.VerificationTokenRepository;
import com.smartwms.service.EmailVerificationService;
import com.smartwms.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final UserRepository               userRepository;
    private final VerificationTokenRepository  verificationTokenRepository;
    private final MailService                  mailService;

    @Value("${app.mail.verification-expiry-hours:24}")
    private int expiryHours;

    // ─── Send Verification Email ──────────────────────────────

    @Override
    public void sendVerificationEmail(User user) {
        // Remove any prior tokens
        verificationTokenRepository.deleteAllByUser(user);

        // Create new token
        VerificationToken token = new VerificationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusHours(expiryHours));
        token.setUsed(false);
        verificationTokenRepository.save(token);

        mailService.sendEmailVerificationEmail(user.getEmail(), user.getFirstName(), token.getToken());
        log.info("Verification email sent to: {}", user.getEmail());
    }

    // ─── Verify Email ─────────────────────────────────────────

    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        VerificationToken token = verificationTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.TOKEN_INVALID,
                        "Invalid or expired verification link. Please request a new one."));

        if (!token.isValid()) {
            if (token.isExpired()) {
                throw new BusinessException(ErrorCode.TOKEN_EXPIRED,
                        "Verification link has expired. Please request a new verification email.");
            }
            throw new BusinessException(ErrorCode.TOKEN_INVALID,
                    "Email has already been verified.");
        }

        // Mark user as verified
        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Invalidate the token
        token.markUsed();
        verificationTokenRepository.save(token);

        // Send welcome email
        mailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    // ─── Resend Verification ──────────────────────────────────

    @Override
    public void resendVerification(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));

        if (user.isEmailVerified()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                    "Your email address is already verified.");
        }

        sendVerificationEmail(user);
        log.info("Verification email resent to: {}", normalizedEmail);
    }
}
