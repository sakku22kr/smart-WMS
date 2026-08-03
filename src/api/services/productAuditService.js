import apiClient from '@/config/axios';

const BASE = '/products';

const productAuditService = {
  getAuditLogs: (productId, params = {}) =>
    apiClient.get(`${BASE}/${productId}/audit-logs`, { params }),

  getRecentAuditLogs: (productId) =>
    apiClient.get(`${BASE}/${productId}/audit-logs/recent`),

  getAuditStats: (productId) =>
    apiClient.get(`${BASE}/${productId}/audit-stats`),

  getAuditLogsByUser: (performedBy, params = {}) =>
    apiClient.get(`${BASE}/audit-logs/user/${performedBy}`, { params }),

  getGlobalAuditStats: () =>
    apiClient.get(`${BASE}/audit-logs/stats`),
};

export default productAuditService;
