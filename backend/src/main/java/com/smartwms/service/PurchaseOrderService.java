package com.smartwms.service;

import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.PurchaseOrderRequest;
import com.smartwms.dto.response.PurchaseOrderResponse;

public interface PurchaseOrderService {

    PurchaseOrderResponse createOrder(PurchaseOrderRequest request);

    PurchaseOrderResponse getOrderById(Long id);

    PurchaseOrderResponse getOrderByNumber(String orderNumber);

    PageResponse<PurchaseOrderResponse> getAllOrders(
            int page, int size, String sort, String direction,
            Long supplierId, Long warehouseId, String status,
            String orderDateFrom, String orderDateTo, String search);

    PurchaseOrderResponse updateOrder(Long id, PurchaseOrderRequest request);

    PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus newStatus);

    PurchaseOrderResponse approveOrder(Long id);

    PurchaseOrderResponse rejectOrder(Long id);

    PurchaseOrderResponse receiveOrder(Long id);

    PurchaseOrderResponse cancelOrder(Long id);

    void deleteOrder(Long id);

    void restoreOrder(Long id);

    long countByStatus(PurchaseOrderStatus status);

    java.math.BigDecimal getTotalOrderValue();

    java.math.BigDecimal getPendingOrderValue();
}
