import apiClient from '@/config/axios';

const BASE = '/roles';

/**
 * Role Management API service.
 * Wraps all calls to /api/v1/roles/* endpoints.
 */
const roleService = {
  /** List all active roles. */
  getAllActive: () => apiClient.get(BASE),

  /** Get a single role by ID. */
  getById: (id) => apiClient.get(`${BASE}/${id}`),

  /** Replace all roles on a user. */
  assignRoles: (userId, roleIds) =>
    apiClient.put(`${BASE}/user/${userId}`, roleIds),

  /** Add a single role to a user. */
  addRole: (userId, roleId) =>
    apiClient.post(`${BASE}/user/${userId}/role/${roleId}`),

  /** Remove a single role from a user. */
  removeRole: (userId, roleId) =>
    apiClient.delete(`${BASE}/user/${userId}/role/${roleId}`),
};

export default roleService;
