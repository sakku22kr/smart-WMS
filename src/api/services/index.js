export { default as dashboardService } from './dashboardService';
export { default as userService } from './userService';
export { default as roleService } from './roleService';
export { default as activityService } from './activityService';
export { default as warehouseService } from './warehouseService';
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';
export { default as supplierService } from './supplierService';
export { default as purchaseOrderService } from './purchaseOrderService';
export { default as reportService } from './reportService';
export { default as inventoryService } from './inventoryService';
export { default as productAuditService } from './productAuditService';

import apiClient from '@/config/axios';

export const notificationService = {
  getAll:   (params) => apiClient.get('/notifications',       { params }),
  markRead: (id)     => apiClient.put(`/notifications/${id}/read`),
  markAllRead: ()    => apiClient.put('/notifications/read-all'),
  delete:   (id)     => apiClient.delete(`/notifications/${id}`),
};
