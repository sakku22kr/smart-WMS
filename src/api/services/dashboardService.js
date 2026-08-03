import apiClient from '@/config/axios';

/**
 * Dashboard API service.
 *
 * All calls hit /api/v1/dashboard/* endpoints.
 */
const dashboardService = {
  /** Aggregated KPI counts (products, categories, warehouses, suppliers). */
  getStats: () => apiClient.get('/dashboard/stats'),

  /** Products whose currentStock ≤ reorderLevel. */
  getLowStock: () => apiClient.get('/dashboard/low-stock'),

  /** Products with currentStock ≤ 0. */
  getOutOfStock: () => apiClient.get('/dashboard/out-of-stock'),

  /** Top products by stock quantity. */
  getTopProducts: (limit = 6) => apiClient.get('/dashboard/top-products', { params: { limit } }),

  /** Detailed product statistics. */
  getProductStatistics: () => apiClient.get('/dashboard/product-statistics'),

  /** Inventory value breakdown by category. */
  getInventoryValue: () => apiClient.get('/dashboard/inventory-value'),

  /** Recent purchase orders for dashboard display. */
  getRecentOrders: (limit = 5) => apiClient.get('/dashboard/recent-orders', { params: { limit } }),
};

export default dashboardService;
