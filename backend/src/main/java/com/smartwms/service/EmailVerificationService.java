package com.smartwms.service;

import com.smartwms.dto.request.VerifyEmailRequest;
import com.smartwms.entity.User;

public interface EmailVerificationService {

    /** Creates a verification token and sends the verification email. */
    void sendVerificationEmail(User user);

    /** Validates the token, marks the user's email as verified, and sends a welcome email. */
    void verifyEmail(VerifyEmailRequest request);

    /** Deletes the existing token and sends a fresh verification email. */
    void resendVerification(String email);
}
