import apiClient from '@/config/axios';

const BASE = '/suppliers';

const supplierService = {
  getAll: (params) => apiClient.get(BASE, { params }),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByCode: (code) => apiClient.get(`${BASE}/code/${code}`),
  getSummaries: () => apiClient.get(`${BASE}/summaries`),
  getDeleted: (params) => apiClient.get(`${BASE}/deleted`, { params }),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`),
  restore: (id) => apiClient.patch(`${BASE}/${id}/restore`),
  activate: (id) => apiClient.patch(`${BASE}/${id}/activate`),
  deactivate: (id) => apiClient.patch(`${BASE}/${id}/deactivate`),
  updateRating: (id, data) => apiClient.patch(`${BASE}/${id}/rating`, data),
  getStats: () => apiClient.get(`${BASE}/stats`),
  getProductsBySupplier: (id, params) => apiClient.get(`${BASE}/${id}/products`, { params }),
  getPurchaseOrdersBySupplier: (id, params) => apiClient.get(`${BASE}/${id}/purchase-orders`, { params }),
  getPerformance: (id) => apiClient.get(`${BASE}/${id}/performance`),
  getTimeline: (id, params) => apiClient.get(`${BASE}/${id}/timeline`, { params }),

  // Documents
  getDocuments: (supplierId) => apiClient.get(`${BASE}/${supplierId}/documents`),
  getDocument: (supplierId, docId) => apiClient.get(`${BASE}/${supplierId}/documents/${docId}`),
  uploadDocument: (supplierId, formData) => apiClient.post(`${BASE}/${supplierId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadDocument: (supplierId, docId) => apiClient.get(`${BASE}/${supplierId}/documents/${docId}/download`, {
    responseType: 'blob',
  }),
  deleteDocument: (supplierId, docId) => apiClient.delete(`${BASE}/${supplierId}/documents/${docId}`),

  // Notes
  getNotes: (supplierId) => apiClient.get(`${BASE}/${supplierId}/notes`),
  getNote: (supplierId, noteId) => apiClient.get(`${BASE}/${supplierId}/notes/${noteId}`),
  createNote: (supplierId, data) => apiClient.post(`${BASE}/${supplierId}/notes`, data),
  updateNote: (supplierId, noteId, data) => apiClient.put(`${BASE}/${supplierId}/notes/${noteId}`, data),
  deleteNote: (supplierId, noteId) => apiClient.delete(`${BASE}/${supplierId}/notes/${noteId}`),
  togglePinNote: (supplierId, noteId) => apiClient.patch(`${BASE}/${supplierId}/notes/${noteId}/pin`),
  getNotesByType: (supplierId, noteType) => apiClient.get(`${BASE}/${supplierId}/notes/type/${noteType}`),

  // Contacts
  getContacts: (supplierId) => apiClient.get(`${BASE}/${supplierId}/contacts`),
  getContact: (supplierId, contactId) => apiClient.get(`${BASE}/${supplierId}/contacts/${contactId}`),
  createContact: (supplierId, data) => apiClient.post(`${BASE}/${supplierId}/contacts`, data),
  updateContact: (supplierId, contactId, data) => apiClient.put(`${BASE}/${supplierId}/contacts/${contactId}`, data),
  deleteContact: (supplierId, contactId) => apiClient.delete(`${BASE}/${supplierId}/contacts/${contactId}`),
  setPrimaryContact: (supplierId, contactId) => apiClient.patch(`${BASE}/${supplierId}/contacts/${contactId}/primary`),

  // Dashboard
  getDashboard: () => apiClient.get(`${BASE}/dashboard`),
  getKpis: () => apiClient.get(`${BASE}/kpis`),
  getTransactionSummary: () => apiClient.get(`${BASE}/transactions/summary`),
};

export default supplierService;
