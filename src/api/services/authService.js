import apiClient from '@/config/axios';

// ─── Auth Service Stubs ────────────────────────────────────────
const authService = {
  login:         (credentials) => apiClient.post('/auth/login', credentials),
  register:      (data)        => apiClient.post('/auth/register', data),
  logout:        ()            => apiClient.post('/auth/logout'),
  forgotPassword:(email)       => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data)        => apiClient.post('/auth/reset-password', data),
  refreshToken:  ()            => apiClient.post('/auth/refresh'),
  getProfile:    ()            => apiClient.get('/auth/me'),
  updateProfile: (data)        => apiClient.put('/auth/me', data),
};

export default authService;
