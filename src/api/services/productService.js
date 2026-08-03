import apiClient from '@/config/axios';

const BASE = '/products';

const productService = {
  getAll: (params) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getBySku: (sku) => apiClient.get(`${BASE}/sku/${sku}`),
  checkSku: (sku, excludeId) => {
    const params = { sku };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${BASE}/check-sku`, { params });
  },
  checkBarcode: (barcode, excludeId) => {
    const params = { barcode };
    if (excludeId) params.excludeId = excludeId;
    return apiClient.get(`${BASE}/check-barcode`, { params });
  },
  getDeleted: (params) => apiClient.get(`${BASE}/deleted`, { params }),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  restore: (id) => apiClient.patch(`${BASE}/${id}/restore`),
  activate: (id) => apiClient.patch(`${BASE}/${id}/activate`),
  deactivate: (id) => apiClient.patch(`${BASE}/${id}/deactivate`),

  // ─── Inventory integration endpoints ───────────────────────
  getInventory: (id) => apiClient.get(`${BASE}/${id}/inventory`),
  getInventorySummary: (params) => apiClient.get(`${BASE}/inventory/summary`, { params }),
  getLowStock: () => apiClient.get(`${BASE}/inventory/low-stock`),
  getOutOfStock: () => apiClient.get(`${BASE}/inventory/out-of-stock`),
  adjustStock: (id, data) => apiClient.post(`${BASE}/${id}/inventory/adjust`, data),
  reserveStock: (id, data) => apiClient.post(`${BASE}/${id}/inventory/reserve`, data),
  releaseReserved: (id, data) => apiClient.post(`${BASE}/${id}/inventory/release`, data),
  confirmDispatch: (id, data) => apiClient.post(`${BASE}/${id}/inventory/dispatch`, data),
};

export default productService;
