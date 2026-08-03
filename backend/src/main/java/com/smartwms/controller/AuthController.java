package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.request.*;
import com.smartwms.dto.response.AuthResponse;
import com.smartwms.service.AuthService;
import com.smartwms.service.EmailVerificationService;
import com.smartwms.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication — login, register, token refresh, logout,
 * forgot/reset password, and email verification endpoints.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/auth")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Authentication", description = "Auth endpoints — all publicly accessible")
@SecurityRequirements
public class AuthController {

    private final AuthService              authService;
    private final PasswordResetService     passwordResetService;
    private final EmailVerificationService emailVerificationService;

    // ─── Login ────────────────────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate with email and password.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    // ─── Register ─────────────────────────────────────────────

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Create a new account.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for: {}", request.getEmail());
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", data));
    }

    // ─── Refresh Token ────────────────────────────────────────

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh Access Token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse data = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", data));
    }

    // ─── Logout ───────────────────────────────────────────────

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Revokes the given refresh token.")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    // ─── Forgot Password ──────────────────────────────────────

    @PostMapping("/forgot-password")
    @Operation(
        summary     = "Forgot Password",
        description = "Sends a password reset email. Always returns 200 (anti-enumeration)."
    )
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot-password request for: {}", request.getEmail());
        passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists for that email, you will receive a reset link shortly."));
    }

    // ─── Reset Password ───────────────────────────────────────

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Sets a new password using a valid reset token.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Password reset successfully. Please log in with your new password."));
    }

    // ─── Email Verification ───────────────────────────────────

    @PostMapping("/verify-email")
    @Operation(summary = "Verify Email", description = "Verifies the email address using the token from the email link.")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. Welcome to Smart WMS!"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend Verification Email")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @RequestParam @Email(message = "Must be a valid email") String email) {
        emailVerificationService.resendVerification(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email resent."));
    }
}
