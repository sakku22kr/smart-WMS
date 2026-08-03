package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.response.*;
import com.smartwms.service.ExcelExportService;
import com.smartwms.service.PdfExportService;
import com.smartwms.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * REST controller for Report endpoints.
 *
 * <p>Base path: {@code /api/v1/reports}</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Reporting and analytics endpoints")
public class ReportController {

    private final ReportService reportService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;

    // ─── JSON Endpoints ──────────────────────────────────────

    @GetMapping("/inventory")
    @Operation(summary = "Inventory Report", description = "Returns inventory stock summaries, category breakdowns, and alerts with optional filters.")
    public ResponseEntity<ApiResponse<InventoryReportResponse>> getInventoryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/inventory filters: dateFrom={}, dateTo={}, warehouseId={}, sortBy={}, sortDir={}, page={}, size={}",
                dateFrom, dateTo, warehouseId, sortBy, sortDir, page, size);
        InventoryReportResponse data = reportService.getInventoryReport(
                dateFrom, dateTo, warehouseId, sortBy, sortDir, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/products")
    @Operation(summary = "Product Report", description = "Returns product catalog analytics with optional search, filters, pagination, and sorting.")
    public ResponseEntity<ApiResponse<ProductReportResponse>> getProductReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/products filters: search={}, category={}, supplier={}, status={}, warehouse={}, sortBy={}, sortDir={}, page={}, size={}",
                search, categoryId, supplierId, status, warehouseId, sortBy, sortDir, page, size);
        ProductReportResponse data = reportService.getProductReport(
                search, categoryId, supplierId, status, warehouseId, sortBy, sortDir, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/warehouses")
    @Operation(summary = "Warehouse Report", description = "Returns warehouse utilization and capacity analytics.")
    public ResponseEntity<ApiResponse<WarehouseReportResponse>> getWarehouseReport() {
        log.info("GET /reports/warehouses");
        WarehouseReportResponse data = reportService.getWarehouseReport();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/suppliers")
    @Operation(summary = "Supplier Report", description = "Returns supplier performance with optional search, filters, pagination, and sorting.")
    public ResponseEntity<ApiResponse<SupplierReportResponse>> getSupplierReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/suppliers filters: search={}, status={}, region={}, sortBy={}, sortDir={}, page={}, size={}",
                search, status, region, sortBy, sortDir, page, size);
        SupplierReportResponse data = reportService.getSupplierReport(
                search, status, region, sortBy, sortDir, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/purchases")
    @Operation(summary = "Purchase Report", description = "Returns purchase order analytics with optional search, filters, pagination, and sorting.")
    public ResponseEntity<ApiResponse<PurchaseReportResponse>> getPurchaseReport(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/purchases filters: search={}, supplier={}, warehouse={}, status={}, dateFrom={}, dateTo={}, sortBy={}, sortDir={}, page={}, size={}",
                search, supplierId, warehouseId, status, dateFrom, dateTo, sortBy, sortDir, page, size);
        PurchaseReportResponse data = reportService.getPurchaseReport(
                search, supplierId, warehouseId, status, dateFrom, dateTo, sortBy, sortDir, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ─── PDF Export Endpoints ─────────────────────────────────

    @GetMapping("/inventory/export")
    @Operation(summary = "Export Inventory Report PDF")
    public ResponseEntity<byte[]> exportInventoryPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/inventory/export (PDF)");
        InventoryReportResponse data = reportService.getInventoryReport(dateFrom, dateTo, warehouseId, sortBy, sortDir, page, size);
        byte[] pdf = pdfExportService.exportInventoryReport(data);
        return buildPdfResponse(pdf, "inventory-report.pdf");
    }

    @GetMapping("/products/export")
    @Operation(summary = "Export Product Report PDF")
    public ResponseEntity<byte[]> exportProductPdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/products/export (PDF)");
        ProductReportResponse data = reportService.getProductReport(search, categoryId, supplierId, status, warehouseId, sortBy, sortDir, page, size);
        byte[] pdf = pdfExportService.exportProductReport(data);
        return buildPdfResponse(pdf, "product-report.pdf");
    }

    @GetMapping("/warehouses/export")
    @Operation(summary = "Export Warehouse Report PDF")
    public ResponseEntity<byte[]> exportWarehousePdf() {
        log.info("GET /reports/warehouses/export (PDF)");
        WarehouseReportResponse data = reportService.getWarehouseReport();
        byte[] pdf = pdfExportService.exportWarehouseReport(data);
        return buildPdfResponse(pdf, "warehouse-report.pdf");
    }

    @GetMapping("/suppliers/export")
    @Operation(summary = "Export Supplier Report PDF")
    public ResponseEntity<byte[]> exportSupplierPdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/suppliers/export (PDF)");
        SupplierReportResponse data = reportService.getSupplierReport(search, status, region, sortBy, sortDir, page, size);
        byte[] pdf = pdfExportService.exportSupplierReport(data);
        return buildPdfResponse(pdf, "supplier-report.pdf");
    }

    @GetMapping("/purchases/export")
    @Operation(summary = "Export Purchase Report PDF")
    public ResponseEntity<byte[]> exportPurchasePdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/purchases/export (PDF)");
        PurchaseReportResponse data = reportService.getPurchaseReport(search, supplierId, warehouseId, status, dateFrom, dateTo, sortBy, sortDir, page, size);
        byte[] pdf = pdfExportService.exportPurchaseReport(data);
        return buildPdfResponse(pdf, "purchase-report.pdf");
    }

    // ─── Excel Export Endpoints ───────────────────────────────

    @GetMapping("/inventory/export-excel")
    @Operation(summary = "Export Inventory Report Excel")
    public ResponseEntity<byte[]> exportInventoryExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/inventory/export-excel");
        InventoryReportResponse data = reportService.getInventoryReport(dateFrom, dateTo, warehouseId, sortBy, sortDir, page, size);
        byte[] xlsx = excelExportService.exportInventoryReport(data);
        return buildExcelResponse(xlsx, "inventory-report.xlsx");
    }

    @GetMapping("/products/export-excel")
    @Operation(summary = "Export Product Report Excel")
    public ResponseEntity<byte[]> exportProductExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/products/export-excel");
        ProductReportResponse data = reportService.getProductReport(search, categoryId, supplierId, status, warehouseId, sortBy, sortDir, page, size);
        byte[] xlsx = excelExportService.exportProductReport(data);
        return buildExcelResponse(xlsx, "product-report.xlsx");
    }

    @GetMapping("/warehouses/export-excel")
    @Operation(summary = "Export Warehouse Report Excel")
    public ResponseEntity<byte[]> exportWarehouseExcel() {
        log.info("GET /reports/warehouses/export-excel");
        WarehouseReportResponse data = reportService.getWarehouseReport();
        byte[] xlsx = excelExportService.exportWarehouseReport(data);
        return buildExcelResponse(xlsx, "warehouse-report.xlsx");
    }

    @GetMapping("/suppliers/export-excel")
    @Operation(summary = "Export Supplier Report Excel")
    public ResponseEntity<byte[]> exportSupplierExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/suppliers/export-excel");
        SupplierReportResponse data = reportService.getSupplierReport(search, status, region, sortBy, sortDir, page, size);
        byte[] xlsx = excelExportService.exportSupplierReport(data);
        return buildExcelResponse(xlsx, "supplier-report.xlsx");
    }

    @GetMapping("/purchases/export-excel")
    @Operation(summary = "Export Purchase Report Excel")
    public ResponseEntity<byte[]> exportPurchaseExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /reports/purchases/export-excel");
        PurchaseReportResponse data = reportService.getPurchaseReport(search, supplierId, warehouseId, status, dateFrom, dateTo, sortBy, sortDir, page, size);
        byte[] xlsx = excelExportService.exportPurchaseReport(data);
        return buildExcelResponse(xlsx, "purchase-report.xlsx");
    }

    // ─── Helpers ──────────────────────────────────────────────

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment").filename(filename).build());
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    private ResponseEntity<byte[]> buildExcelResponse(byte[] xlsx, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.builder("attachment").filename(filename).build());
        headers.setContentLength(xlsx.length);
        return new ResponseEntity<>(xlsx, headers, HttpStatus.OK);
    }
}
