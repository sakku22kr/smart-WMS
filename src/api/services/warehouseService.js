import apiClient from '@/config/axios';

const BASE = '/warehouses';

const warehouseService = {
  getAll: (params) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByCode: (code) => apiClient.get(`${BASE}/code/${code}`),
  checkCode: (code, excludeId) => {
    const params = { code };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${BASE}/check-code`, { params });
  },
  getStats: () => apiClient.get(`${BASE}/stats`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  restore: (id) => apiClient.patch(`${BASE}/${id}/restore`),
  activate: (id) => apiClient.patch(`${BASE}/${id}/activate`),
  deactivate: (id) => apiClient.patch(`${BASE}/${id}/deactivate`),
  setMaintenance: (id) => apiClient.patch(`${BASE}/${id}/maintenance`),
};

export default warehouseService;
