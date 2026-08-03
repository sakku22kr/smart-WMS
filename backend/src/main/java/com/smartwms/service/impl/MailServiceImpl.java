package com.smartwms.service.impl;

import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.service.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Mail service implementation — sends HTML emails via SMTP.
 *
 * <p>If SMTP is not configured ({@code MAIL_USERNAME} env var is blank),
 * the service logs the email content to the console instead of sending.
 * This allows development and testing without a real mail server.</p>
 *
 * <p>Set the following environment variables to enable real email sending:
 * {@code MAIL_HOST}, {@code MAIL_PORT}, {@code MAIL_USERNAME}, {@code MAIL_PASSWORD}.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@smartwms.io}")
    private String fromAddress;

    @Value("${app.mail.from-name:Smart WMS}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    // ─── MailService Implementation ───────────────────────────

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
        String link    = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "Reset your Smart WMS password";
        String body    = buildPasswordResetHtml(firstName, link);

        if (!isMailConfigured()) {
            log.info("╔══ SIMULATED EMAIL ══════════════════════════╗");
            log.info("║ TO:      {}", to);
            log.info("║ SUBJECT: {}", subject);
            log.info("║ LINK:    {}", link);
            log.info("╚═════════════════════════════════════════════╝");
            return;
        }

        sendHtmlEmail(to, subject, body);
        log.info("Password reset email sent to: {}", to);
    }

    @Override
    public void sendEmailVerificationEmail(String to, String firstName, String verificationToken) {
        String link    = frontendUrl + "/verify-email?token=" + verificationToken;
        String subject = "Verify your Smart WMS email address";
        String body    = buildVerificationHtml(firstName, link);

        if (!isMailConfigured()) {
            log.info("╔══ SIMULATED EMAIL ══════════════════════════╗");
            log.info("║ TO:      {}", to);
            log.info("║ SUBJECT: {}", subject);
            log.info("║ LINK:    {}", link);
            log.info("╚═════════════════════════════════════════════╝");
            return;
        }

        sendHtmlEmail(to, subject, body);
        log.info("Verification email sent to: {}", to);
    }

    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to Smart WMS, " + firstName + "!";
        String body    = buildWelcomeHtml(firstName);

        if (!isMailConfigured()) {
            log.info("╔══ SIMULATED EMAIL ══════════════════════════╗");
            log.info("║ TO:      {}", to);
            log.info("║ SUBJECT: {}", subject);
            log.info("╚═════════════════════════════════════════════╝");
            return;
        }

        sendHtmlEmail(to, subject, body);
    }

    // ─── Internal Helpers ─────────────────────────────────────

    private boolean isMailConfigured() {
        return mailUsername != null && !mailUsername.isBlank();
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to send email. Please try again later.");
        }
    }

    // ─── HTML Templates ───────────────────────────────────────

    private String buildPasswordResetHtml(String firstName, String link) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 16px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">🔑 Reset Password</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Smart WMS — Enterprise Edition</p>
                </div>
                <div style="padding:40px 32px;">
                  <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">Hi <strong>%s</strong>,</p>
                  <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 32px;">
                    We received a request to reset your password. Click the button below to set a new password.
                    This link is valid for <strong>15 minutes</strong>.
                  </p>
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                      Reset My Password
                    </a>
                  </div>
                  <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">
                    If you didn't request a password reset, you can safely ignore this email.
                    Your password will remain unchanged.
                  </p>
                </div>
                <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="font-size:12px;color:#94a3b8;margin:0;">© 2025 Smart WMS. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName, link);
    }

    private String buildVerificationHtml(String firstName, String link) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 16px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">✉️ Verify Email</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Smart WMS — Enterprise Edition</p>
                </div>
                <div style="padding:40px 32px;">
                  <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">Hi <strong>%s</strong>,</p>
                  <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 32px;">
                    Welcome to Smart WMS! Please verify your email address to complete your account setup.
                    This link is valid for <strong>24 hours</strong>.
                  </p>
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                      Verify Email Address
                    </a>
                  </div>
                  <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                </div>
                <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="font-size:12px;color:#94a3b8;margin:0;">© 2025 Smart WMS. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName, link);
    }

    private String buildWelcomeHtml(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 16px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">🎉 Welcome!</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Smart WMS — Enterprise Edition</p>
                </div>
                <div style="padding:40px 32px;">
                  <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">Hi <strong>%s</strong>,</p>
                  <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 0;">
                    Your account has been verified. You now have full access to Smart WMS.
                    Start managing your inventory and warehouses today!
                  </p>
                </div>
                <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="font-size:12px;color:#94a3b8;margin:0;">© 2025 Smart WMS. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName);
    }
}
