package com.smartwms.service;

import com.smartwms.dto.request.ForgotPasswordRequest;
import com.smartwms.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    /**
     * Sends a password reset email if the given email belongs to an existing user.
     * Always returns success (even if email not found) to prevent user enumeration.
     */
    void initiatePasswordReset(ForgotPasswordRequest request);

    /**
     * Validates the reset token and updates the user's password.
     * Revokes all refresh tokens after a successful reset (force re-login).
     */
    void resetPassword(ResetPasswordRequest request);
}
