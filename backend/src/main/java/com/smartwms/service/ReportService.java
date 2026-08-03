package com.smartwms.service;

import com.smartwms.dto.response.InventoryReportResponse;
import com.smartwms.dto.response.ProductReportResponse;
import com.smartwms.dto.response.PurchaseReportResponse;
import com.smartwms.dto.response.SupplierReportResponse;
import com.smartwms.dto.response.WarehouseReportResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service contract for generating reports.
 */
public interface ReportService {

    /** Generate inventory report with stock summaries and breakdowns. */
    InventoryReportResponse getInventoryReport();

    /** Generate inventory report with filters, pagination, and sorting. */
    InventoryReportResponse getInventoryReport(LocalDateTime dateFrom, LocalDateTime dateTo,
                                               Long warehouseId, String sortBy, String sortDir,
                                               int page, int size);

    /** Generate product catalog report. */
    ProductReportResponse getProductReport();

    /** Generate product report with filters, search, pagination, and sorting. */
    ProductReportResponse getProductReport(String search, Long categoryId, Long supplierId,
                                           String status, Long warehouseId,
                                           String sortBy, String sortDir, int page, int size);

    /** Generate warehouse utilization report. */
    WarehouseReportResponse getWarehouseReport();

    /** Generate supplier performance report. */
    SupplierReportResponse getSupplierReport();

    /** Generate supplier report with filters, search, pagination, and sorting. */
    SupplierReportResponse getSupplierReport(String search, String status, String region,
                                             String sortBy, String sortDir, int page, int size);

    /** Generate purchase order report. */
    PurchaseReportResponse getPurchaseReport();

    /** Generate purchase report with filters, search, pagination, and sorting. */
    PurchaseReportResponse getPurchaseReport(String search, Long supplierId, Long warehouseId,
                                             String status, LocalDate dateFrom, LocalDate dateTo,
                                             String sortBy, String sortDir, int page, int size);
}
