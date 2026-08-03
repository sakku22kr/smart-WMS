import apiClient from '@/config/axios';

const buildParams = (params = {}) => {
  const query = {};
  if (params.page != null)         query.page         = params.page;
  if (params.size != null)         query.size         = params.size;
  if (params.sort)                 query.sort          = params.sort;
  if (params.direction)            query.direction     = params.direction;
  if (params.search)               query.search        = params.search;
  if (params.productId != null)    query.productId     = params.productId;
  if (params.warehouseId != null)  query.warehouseId   = params.warehouseId;
  if (params.transactionType)      query.transactionType = params.transactionType;
  if (params.dateFrom)             query.dateFrom       = params.dateFrom;
  if (params.dateTo)               query.dateTo         = params.dateTo;
  if (params.performedBy)          query.performedBy    = params.performedBy;
  return query;
};

const inventoryService = {
  // ─── CRUD ──────────────────────────────────────
  getAll:      (params)  => apiClient.get('/inventory', { params: buildParams(params) }),
  getById:     (id)      => apiClient.get(`/inventory/${id}`),
  create:      (data)    => apiClient.post('/inventory', data),
  update:      (id, d)   => apiClient.put(`/inventory/${id}`, d),
  delete:      (id)      => apiClient.delete(`/inventory/${id}`),
  restore:     (id)      => apiClient.patch(`/inventory/${id}/restore`),

  // ─── Filtered lists ────────────────────────────
  getByProduct:    (productId, params) => apiClient.get(`/inventory/product/${productId}`, { params: buildParams(params) }),
  getByWarehouse:  (warehouseId, params) => apiClient.get(`/inventory/warehouse/${warehouseId}`, { params: buildParams(params) }),
  countByProduct:  (productId)  => apiClient.get(`/inventory/count/product/${productId}`),
  countByWarehouse:(warehouseId)=> apiClient.get(`/inventory/count/warehouse/${warehouseId}`),

  // ─── Stock Management ─────────────────────────
  stockIn:      (data)     => apiClient.post('/stock/in', data),
  stockOut:     (data)     => apiClient.post('/stock/out', data),
  adjustStock:  (data)     => apiClient.post('/stock/adjust', data),
  getStockLevel:(productId, warehouseId) => apiClient.get(`/stock/level/${productId}/${warehouseId}`),
  getStockLevelsByWarehouse: (warehouseId, params) => apiClient.get(`/stock/levels/warehouse/${warehouseId}`, { params: buildParams(params) }),
  getStockLevelsByProduct:   (productId, params)   => apiClient.get(`/stock/levels/product/${productId}`, { params: buildParams(params) }),

  // ─── History ──────────────────────────────────
  getHistory:        (params)  => apiClient.get('/inventory/history', { params: buildParams(params) }),
  getHistorySummary: (params)  => apiClient.get('/inventory/history/summary', { params: buildParams(params) }),

  // ─── Alerts ──────────────────────────────────
  getLowStockProducts:   ()            => apiClient.get('/inventory/alerts/low-stock'),
  getOutOfStockProducts: ()            => apiClient.get('/inventory/alerts/out-of-stock'),
  getReorderAlerts:      ()            => apiClient.get('/inventory/alerts/reorder'),
  getCriticalAlerts:     ()            => apiClient.get('/inventory/alerts/critical'),
  getOverstockedProducts:()            => apiClient.get('/inventory/alerts/overstocked'),
  getInventoryStatistics:()            => apiClient.get('/inventory/alerts/statistics'),
  getStockHealthScore:   ()            => apiClient.get('/inventory/alerts/health-score'),
};

export default inventoryService;
