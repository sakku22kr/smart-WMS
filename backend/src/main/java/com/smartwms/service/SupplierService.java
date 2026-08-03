package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierRequest;
import com.smartwms.dto.request.SupplierRatingRequest;
import com.smartwms.dto.response.SupplierResponse;
import com.smartwms.dto.response.SupplierStatsResponse;
import com.smartwms.dto.response.SupplierSummaryResponse;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.dto.response.SupplierPerformanceResponse;
import com.smartwms.dto.response.SupplierTimelineEntry;
import com.smartwms.dto.response.SupplierDashboardResponse;
import com.smartwms.dto.response.SupplierKpiResponse;
import com.smartwms.dto.response.SupplierTransactionSummaryResponse;

import java.util.List;

/**
 * Service contract for Supplier CRUD operations.
 */
public interface SupplierService {

    SupplierResponse create(SupplierRequest request);

    SupplierResponse getById(Long id);

    SupplierResponse getByCode(String code);

    PageResponse<SupplierResponse> getAll(int page, int size, String sortBy, String sortDir, String search, String status, String city, String companyName);

    /** Lightweight list for dropdown/select UI. */
    List<SupplierSummaryResponse> getAllSummaries();

    SupplierResponse update(Long id, SupplierRequest request);

    void delete(Long id);

    void restore(Long id);

    PageResponse<SupplierResponse> getDeletedSuppliers(String search, int page, int size);

    SupplierResponse activateSupplier(Long id);

    SupplierResponse deactivateSupplier(Long id);

    SupplierResponse updateRating(Long id, SupplierRatingRequest request);

    SupplierStatsResponse getSupplierStats();

    PageResponse<ProductResponse> getProductsBySupplier(Long supplierId, int page, int size, String sortBy, String sortDir);

    PageResponse<PurchaseOrderResponse> getPurchaseOrdersBySupplier(Long supplierId, int page, int size, String sortBy, String sortDir);

    /** Get performance analytics for a supplier. */
    SupplierPerformanceResponse getSupplierPerformance(Long supplierId);

    /** Get unified activity timeline for a supplier. */
    List<SupplierTimelineEntry> getSupplierTimeline(Long supplierId, int limit);

    /** Get supplier dashboard overview. */
    SupplierDashboardResponse getSupplierDashboard();

    /** Get supplier KPI metrics. */
    SupplierKpiResponse getSupplierKpis();

    /** Get supplier transaction summary. */
    SupplierTransactionSummaryResponse getTransactionSummary();
}
