import apiClient from '@/config/axios';

const BASE = '/categories';

const categoryService = {
  getAll: (params) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByCode: (code) => apiClient.get(`${BASE}/code/${code}`),
  checkCode: (code, excludeId) => {
    const params = { code };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${BASE}/check-code`, { params });
  },
  getRoots: () => apiClient.get(`${BASE}/roots`),
  getSubCategories: (parentId) => apiClient.get(`${BASE}/${parentId}/subcategories`),
  getTree: () => apiClient.get(`${BASE}/tree`),
  getPath: (id) => apiClient.get(`${BASE}/${id}/path`),
  getDeleted: (search) => apiClient.get(`${BASE}/deleted`, { params: search ? { search } : {} }),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  restore: (id) => apiClient.patch(`${BASE}/${id}/restore`),
  activate: (id) => apiClient.patch(`${BASE}/${id}/activate`),
  deactivate: (id) => apiClient.patch(`${BASE}/${id}/deactivate`),
};

export default categoryService;
