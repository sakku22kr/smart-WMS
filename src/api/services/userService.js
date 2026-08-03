import apiClient from '@/config/axios';

const BASE = '/users';

/**
 * User Management API service.
 * Wraps all calls to /api/v1/users/* endpoints.
 */
const userService = {
  /** Paginated list with search/sort. */
  getAll: (params) => apiClient.get(BASE, { params }),

  /** Get user by ID. */
  getById: (id) => apiClient.get(`${BASE}/${id}`),

  /** Get user by email. */
  getByEmail: (email) => apiClient.get(`${BASE}/email/${email}`),

  /** Create a new user. */
  create: (data) => apiClient.post(BASE, data),

  /** Update an existing user. */
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),

  /** Soft-delete a user. */
  delete: (id) => apiClient.delete(`${BASE}/${id}`),

  /** Toggle enabled/disabled status. */
  toggleStatus: (id) => apiClient.patch(`${BASE}/${id}/toggle-status`),

  /** Explicitly activate a user. */
  activate: (id) => apiClient.patch(`${BASE}/${id}/activate`),

  /** Explicitly deactivate a user. */
  deactivate: (id) => apiClient.patch(`${BASE}/${id}/deactivate`),

  /** Lightweight list for dropdowns/selects. */
  getSummaries: () => apiClient.get(`${BASE}/summaries`),

  // ─── Profile ──────────────────────────────────────────────

  /** Get the authenticated user's full profile. */
  getMyProfile: () => apiClient.get(`${BASE}/me`),

  /** Update the authenticated user's profile. */
  updateMyProfile: (data) => apiClient.put(`${BASE}/me`, data),

  /** Change the authenticated user's password. */
  changePassword: (data) => apiClient.patch(`${BASE}/me/change-password`, data),

  /** Upload profile picture (multipart form data). */
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.patch(`${BASE}/me/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default userService;
