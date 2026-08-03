import apiClient from '@/config/axios';

const buildParams = (params = {}) => {
  const query = {};
  if (params.page != null)             query.page             = params.page;
  if (params.size != null)             query.size             = params.size;
  if (params.sort)                     query.sort              = params.sort;
  if (params.direction)                query.direction         = params.direction;
  if (params.search)                   query.search            = params.search;
  if (params.supplierId != null)       query.supplierId        = params.supplierId;
  if (params.warehouseId != null)      query.warehouseId       = params.warehouseId;
  if (params.status)                   query.status            = params.status;
  if (params.orderDateFrom)            query.orderDateFrom     = params.orderDateFrom;
  if (params.orderDateTo)              query.orderDateTo       = params.orderDateTo;
  return query;
};

const BASE = '/purchase-orders';

const purchaseOrderService = {
  // ─── CRUD ──────────────────────────────────────
  getAll:      (params)  => apiClient.get(BASE, { params: buildParams(params) }),
  getById:     (id)      => apiClient.get(`${BASE}/${id}`),
  getByNumber: (number)  => apiClient.get(`${BASE}/number/${number}`),
  create:      (data)    => apiClient.post(BASE, data),
  update:      (id, d)   => apiClient.put(`${BASE}/${id}`, d),
  delete:      (id)      => apiClient.delete(`${BASE}/${id}`),
  restore:     (id)      => apiClient.patch(`${BASE}/${id}/restore`),

  // ─── Status Actions ────────────────────────────
  updateStatus:  (id, status) => apiClient.patch(`${BASE}/${id}/status`, null, { params: { status } }),
  approve:       (id)         => apiClient.patch(`${BASE}/${id}/approve`),
  reject:        (id)         => apiClient.patch(`${BASE}/${id}/reject`),
  receive:       (id)         => apiClient.patch(`${BASE}/${id}/receive`),
  cancel:        (id)         => apiClient.patch(`${BASE}/${id}/cancel`),

  // ─── Stats ─────────────────────────────────────
  countByStatus:   (status) => apiClient.get(`${BASE}/stats/count`, { params: { status } }),
  totalValue:      ()       => apiClient.get(`${BASE}/stats/total-value`),
  pendingValue:    ()       => apiClient.get(`${BASE}/stats/pending-value`),
};

export default purchaseOrderService;
