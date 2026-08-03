package com.smartwms.service;

/**
 * Contract for all outbound email operations.
 *
 * <p>When SMTP is not configured ({@code spring.mail.username} is blank),
 * the implementation falls back to logging the email content — useful for local development.</p>
 */
public interface MailService {

    void sendPasswordResetEmail(String to, String firstName, String resetToken);

    void sendEmailVerificationEmail(String to, String firstName, String verificationToken);

    void sendWelcomeEmail(String to, String firstName);
}
