package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.WarehouseRequest;
import com.smartwms.dto.response.WarehouseResponse;
import com.smartwms.dto.response.WarehouseStatsResponse;

public interface WarehouseService {

    PageResponse<WarehouseResponse> getAllWarehouses(
            int page, int size, String sort, String direction,
            String search, String status, Double minCapacity, Double maxCapacity);

    WarehouseResponse getWarehouseById(Long id);

    WarehouseResponse getWarehouseByCode(String code);

    WarehouseResponse createWarehouse(WarehouseRequest request);

    WarehouseResponse updateWarehouse(Long id, WarehouseRequest request);

    void deleteWarehouse(Long id);

    void restoreWarehouse(Long id);

    WarehouseResponse activateWarehouse(Long id);

    WarehouseResponse deactivateWarehouse(Long id);

    WarehouseResponse setMaintenanceWarehouse(Long id);

    boolean isCodeAvailable(String code, Long excludeId);

    WarehouseStatsResponse getWarehouseStats();
}
