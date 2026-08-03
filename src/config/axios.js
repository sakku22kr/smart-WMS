/**
 * Configured Axios instance for the Smart WMS API.
 *
 * Features:
 *  ✅ Base URL from VITE_API_URL env var
 *  ✅ Automatic Bearer token injection on every request
 *  ✅ Proactive token refresh — refreshes BEFORE expiry (30s grace window)
 *  ✅ Reactive 401 refresh — retries once after receiving 401 from server
 *  ✅ Request queue — concurrent requests wait for one refresh to complete
 *  ✅ 403 toast — permission denied notification
 *  ✅ Network error toast with retry guidance
 *  ✅ Auth endpoint bypass — /auth/* never gets retry loop
 *  ✅ Remember Me — routes through sessionStorage utility
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '@/utils/sessionStorage';
import { isTokenExpired } from '@/utils/jwtUtils';

export { storage };  // re-export so existing imports keep working

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// ── Create instance ────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Refresh state ──────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
};

/** Internal refresh — bypasses the apiClient to avoid interceptor loops */
const performRefresh = async () => {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
    refreshToken,
  });

  const { accessToken, refreshToken: newRefreshToken } = data.data;
  storage.setTokens(accessToken, newRefreshToken);
  apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  return accessToken;
};

// ── Request interceptor — attach JWT + proactive refresh ───────
apiClient.interceptors.request.use(
  async (config) => {
    // Don't intercept auth endpoints
    if (config.url?.includes('/auth/')) return config;

    let token = storage.getAccessToken();

    // Proactive refresh: if token is near expiry, refresh before sending
    if (token && isTokenExpired(token, 60_000)) {
      const refreshToken = storage.getRefreshToken();
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          token = await performRefresh();
        } catch {
          storage.clearTokens();
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired'));
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Update activity timestamp on every request
    storage.updateLastActivity();

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — reactive 401 handling ───────────────
apiClient.interceptors.response.use(
  (response) => {
    storage.updateLastActivity();
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // ── 401: Token expired or invalid ─────────────────────────
    if (status === 401 && !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/')) {

      const refreshToken = storage.getRefreshToken();

      if (!refreshToken) {
        storage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing            = true;

      try {
        const newToken = await performRefresh();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearTokens();
        toast.error('Your session has expired. Please log in again.', {
          id: 'session-expired',
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: Forbidden ────────────────────────────────────────
    if (status === 403) {
      toast.error('You do not have permission to perform this action.', {
        id: 'forbidden',
      });
    }

    // ── 500: Server error ─────────────────────────────────────
    if (status >= 500) {
      const msg = error.response?.data?.message || 'A server error occurred. Please try again.';
      toast.error(msg, { id: 'server-error' });
    }

    // ── Network error ─────────────────────────────────────────
    if (!error.response) {
      toast.error('Cannot connect to server. Check your connection.', {
        id: 'network-error',
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
