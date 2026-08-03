/**
 * Authentication API service.
 * Wraps all calls to /api/v1/auth/* endpoints.
 *
 * NOTE: The axios interceptor (src/config/axios.js) already unwraps response.data,
 * so each call here returns the ApiResponse body directly:
 *   { success, message, data: <AuthResponse | void> }
 *
 * To get the AuthResponse payload we access `.data` once — NOT `.data.data`.
 */

import apiClient from '@/config/axios';

const AUTH_BASE = '/auth';

const authService = {
  /** Login with email + password. Returns AuthResponse payload. */
  login: async (credentials) => {
    // axios interceptor returns ApiResponse body; payload is at .data
    const result = await apiClient.post(`${AUTH_BASE}/login`, credentials);
    return result.data;
  },

  /** Register a new account. Returns AuthResponse payload. */
  register: async (payload) => {
    const result = await apiClient.post(`${AUTH_BASE}/register`, payload);
    return result.data;
  },

  /** Refresh access token using an opaque refresh token. Returns AuthResponse payload. */
  refreshToken: async (refreshToken) => {
    const result = await apiClient.post(`${AUTH_BASE}/refresh-token`, { refreshToken });
    return result.data;
  },

  /** Logout — revokes the refresh token. */
  logout: async (refreshToken) => {
    await apiClient.post(`${AUTH_BASE}/logout`, { refreshToken });
  },

  /**
   * Request a password reset email.
   * Always resolves (even if email is unknown) — anti-enumeration.
   */
  forgotPassword: async (email) => {
    const result = await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
    return result;
  },

  /**
   * Reset the password using the token from the email link.
   * @param {{ token, newPassword, confirmPassword }} payload
   */
  resetPassword: async (payload) => {
    const result = await apiClient.post(`${AUTH_BASE}/reset-password`, payload);
    return result;
  },

  /**
   * Verify email address using the token from the verification email.
   * @param {string} token  the raw UUID token from the URL
   */
  verifyEmail: async (token) => {
    const result = await apiClient.post(`${AUTH_BASE}/verify-email`, { token });
    return result;
  },

  /**
   * Resend the verification email to the given address.
   * @param {string} email
   */
  resendVerification: async (email) => {
    const result = await apiClient.post(`${AUTH_BASE}/resend-verification`, null, {
      params: { email },
    });
    return result;
  },
};

export default authService;
