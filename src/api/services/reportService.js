import apiClient from '@/config/axios';
import { storage } from '@/config/axios';

const BASE = '/reports';

const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') query.append(key, value);
  });
  return query.toString();
};

/** Download a file blob from endpoint. */
const downloadFile = async (endpoint, filename, mimeType) => {
  const token = storage.getAccessToken();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  const url = `${baseURL}${endpoint}`;

  const res = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });

  const blob = new Blob([res], { type: mimeType });
  const link = window.document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};

const reportService = {
  getInventoryReport: (params = {}) => {
    const qs = buildQuery(params);
    return apiClient.get(`${BASE}/inventory${qs ? `?${qs}` : ''}`);
  },
  getProductReport: (params = {}) => {
    const qs = buildQuery(params);
    return apiClient.get(`${BASE}/products${qs ? `?${qs}` : ''}`);
  },
  getWarehouseReport: () => apiClient.get(`${BASE}/warehouses`),
  getSupplierReport: (params = {}) => {
    const qs = buildQuery(params);
    return apiClient.get(`${BASE}/suppliers${qs ? `?${qs}` : ''}`);
  },
  getPurchaseReport: (params = {}) => {
    const qs = buildQuery(params);
    return apiClient.get(`${BASE}/purchases${qs ? `?${qs}` : ''}`);
  },

  // ─── PDF Export ──────────────────────────────────────────
  exportInventoryPdf: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/inventory/export${qs ? `?${qs}` : ''}`, 'inventory-report.pdf', 'application/pdf');
  },
  exportProductPdf: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/products/export${qs ? `?${qs}` : ''}`, 'product-report.pdf', 'application/pdf');
  },
  exportWarehousePdf: () => downloadFile(`${BASE}/warehouses/export`, 'warehouse-report.pdf', 'application/pdf'),
  exportSupplierPdf: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/suppliers/export${qs ? `?${qs}` : ''}`, 'supplier-report.pdf', 'application/pdf');
  },
  exportPurchasePdf: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/purchases/export${qs ? `?${qs}` : ''}`, 'purchase-report.pdf', 'application/pdf');
  },

  // ─── Excel Export ────────────────────────────────────────
  exportInventoryExcel: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/inventory/export-excel${qs ? `?${qs}` : ''}`, 'inventory-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  },
  exportProductExcel: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/products/export-excel${qs ? `?${qs}` : ''}`, 'product-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  },
  exportWarehouseExcel: () => downloadFile(`${BASE}/warehouses/export-excel`, 'warehouse-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
  exportSupplierExcel: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/suppliers/export-excel${qs ? `?${qs}` : ''}`, 'supplier-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  },
  exportPurchaseExcel: (params = {}) => {
    const qs = buildQuery(params);
    return downloadFile(`${BASE}/purchases/export-excel${qs ? `?${qs}` : ''}`, 'purchase-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  },
};

export default reportService;
