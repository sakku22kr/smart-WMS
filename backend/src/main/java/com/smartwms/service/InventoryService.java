package com.smartwms.service;

import com.smartwms.constants.InventoryTransactionType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.InventoryRequest;
import com.smartwms.dto.response.InventoryResponse;

import java.math.BigDecimal;

public interface InventoryService {

    InventoryResponse createTransaction(InventoryRequest request, String performedBy);

    InventoryResponse getTransactionById(Long id);

    PageResponse<InventoryResponse> getAllTransactions(
            int page, int size, String sort, String direction,
            Long productId, Long warehouseId, String transactionType,
            String search);

    PageResponse<InventoryResponse> getTransactionsByProduct(Long productId, int page, int size);

    PageResponse<InventoryResponse> getTransactionsByWarehouse(Long warehouseId, int page, int size);

    long countByProduct(Long productId);

    long countByWarehouse(Long warehouseId);

    InventoryResponse updateTransaction(Long id, InventoryRequest request);

    void deleteTransaction(Long id);

    void restoreTransaction(Long id);

    void createPoStockTransaction(Long productId, Long warehouseId, int quantity,
                                   BigDecimal unitCost, String referenceNumber, String reason,
                                   String performedBy);
}
