import apiClient from '@/config/axios';

const BASE = '/activity-logs';

/**
 * Activity Log API service.
 * Wraps all calls to /api/v1/activity-logs/* endpoints.
 */
const activityService = {
  /** Paginated list of all activity logs. */
  getAll: (params) => apiClient.get(BASE, { params }),

  /** Activity logs for a specific user. */
  getByUserId: (userId, params) => apiClient.get(`${BASE}/user/${userId}`, { params }),

  /** Activity logs for a specific target entity (e.g., category ID). */
  getByTargetId: (targetId, params) => apiClient.get(`${BASE}/target/${targetId}`, { params }),

  /** Recent activity logs (last 50). */
  getRecent: () => apiClient.get(`${BASE}/recent`),
};

export default activityService;
