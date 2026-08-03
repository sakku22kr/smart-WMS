package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierRequest;
import com.smartwms.dto.request.SupplierRatingRequest;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.dto.response.SupplierResponse;
import com.smartwms.dto.response.SupplierStatsResponse;
import com.smartwms.dto.response.SupplierSummaryResponse;
import com.smartwms.dto.response.SupplierPerformanceResponse;
import com.smartwms.dto.response.SupplierTimelineEntry;
import com.smartwms.dto.response.SupplierDashboardResponse;
import com.smartwms.dto.response.SupplierKpiResponse;
import com.smartwms.dto.response.SupplierTransactionSummaryResponse;
import com.smartwms.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Supplier CRUD operations.
 *
 * <p>Base path: {@code /api/v1/suppliers}</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/suppliers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Suppliers", description = "Supplier / vendor management endpoints")
public class SupplierController {

    private final SupplierService supplierService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Supplier")
    public ResponseEntity<ApiResponse<SupplierResponse>> create(
            @Valid @RequestBody SupplierRequest request) {
        log.info("POST /suppliers — code={}", request.getCode());
        SupplierResponse response = supplierService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get Supplier by ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Supplier by Code")
    public ResponseEntity<ApiResponse<SupplierResponse>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getByCode(code)));
    }

    @GetMapping
    @Operation(summary = "List Suppliers", description = "Paginated, sortable list with optional keyword search, status, city, and company name filters.")
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> getAll(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "25")   int    size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir,
            @RequestParam(required = false)      String search,
            @RequestParam(required = false)      String status,
            @RequestParam(required = false)      String city,
            @RequestParam(required = false)      String companyName) {
        PageResponse<SupplierResponse> data = supplierService.getAll(page, size, sortBy, sortDir, search, status, city, companyName);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/summaries")
    @Operation(summary = "Get All Supplier Summaries", description = "Lightweight list for dropdown/select UI.")
    public ResponseEntity<ApiResponse<List<SupplierSummaryResponse>>> getSummaries() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAllSummaries()));
    }

    @GetMapping("/deleted")
    @Operation(summary = "Get Deleted Suppliers", description = "Returns all soft-deleted suppliers for admin recovery.")
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> getDeleted(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getDeletedSuppliers(search, page, size)));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Supplier")
    public ResponseEntity<ApiResponse<SupplierResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        log.info("PUT /suppliers/{}", id);
        SupplierResponse response = supplierService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Delete ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Supplier", description = "Soft-deletes the supplier.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        log.info("DELETE /suppliers/{}", id);
        supplierService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Supplier", description = "Restores a previously soft-deleted supplier.")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        log.info("PATCH /suppliers/{}/restore", id);
        supplierService.restore(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier restored successfully"));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate Supplier", description = "Sets the supplier status to ACTIVE.")
    public ResponseEntity<ApiResponse<SupplierResponse>> activate(@PathVariable Long id) {
        log.info("PATCH /suppliers/{}/activate", id);
        SupplierResponse response = supplierService.activateSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate Supplier", description = "Sets the supplier status to INACTIVE.")
    public ResponseEntity<ApiResponse<SupplierResponse>> deactivate(@PathVariable Long id) {
        log.info("PATCH /suppliers/{}/deactivate", id);
        SupplierResponse response = supplierService.deactivateSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deactivated successfully", response));
    }

    // ─── Rating ───────────────────────────────────────────────

    @PatchMapping("/{id}/rating")
    @Operation(summary = "Update Supplier Rating", description = "Sets the supplier rating (1.0–5.0 scale).")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRatingRequest request) {
        log.info("PATCH /suppliers/{}/rating — {}", id, request.getRating());
        SupplierResponse response = supplierService.updateRating(id, request);
        return ResponseEntity.ok(ApiResponse.success("Supplier rating updated successfully", response));
    }

    // ─── Stats ────────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Supplier Statistics", description = "Returns aggregate supplier statistics.")
    public ResponseEntity<ApiResponse<SupplierStatsResponse>> getStats() {
        SupplierStatsResponse stats = supplierService.getSupplierStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ─── Products by Supplier ─────────────────────────────────

    @GetMapping("/{id}/products")
    @Operation(summary = "Get Products by Supplier", description = "Returns paginated products supplied by this supplier.")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProductsBySupplier(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<ProductResponse> data = supplierService.getProductsBySupplier(id, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ─── Purchase Orders by Supplier ──────────────────────────

    @GetMapping("/{id}/purchase-orders")
    @Operation(summary = "Get Purchase Orders by Supplier", description = "Returns paginated purchase orders for this supplier.")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderResponse>>> getPurchaseOrdersBySupplier(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<PurchaseOrderResponse> data = supplierService.getPurchaseOrdersBySupplier(id, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ─── Performance Analytics ────────────────────────────────

    @GetMapping("/{id}/performance")
    @Operation(summary = "Get Supplier Performance", description = "Returns performance analytics for a specific supplier.")
    public ResponseEntity<ApiResponse<SupplierPerformanceResponse>> getSupplierPerformance(@PathVariable Long id) {
        SupplierPerformanceResponse performance = supplierService.getSupplierPerformance(id);
        return ResponseEntity.ok(ApiResponse.success(performance));
    }

    // ─── Activity Timeline ────────────────────────────────────

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get Supplier Timeline", description = "Returns unified activity timeline for a specific supplier.")
    public ResponseEntity<ApiResponse<List<SupplierTimelineEntry>>> getSupplierTimeline(
            @PathVariable Long id,
            @RequestParam(defaultValue = "25") int limit) {
        List<SupplierTimelineEntry> timeline = supplierService.getSupplierTimeline(id, limit);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }

    // ─── Dashboard Overview ──────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Supplier Dashboard", description = "Returns supplier dashboard overview with key metrics and recent activities.")
    public ResponseEntity<ApiResponse<SupplierDashboardResponse>> getSupplierDashboard() {
        SupplierDashboardResponse dashboard = supplierService.getSupplierDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    // ─── Supplier KPIs ───────────────────────────────────────

    @GetMapping("/kpis")
    @Operation(summary = "Supplier KPIs", description = "Returns supplier KPI metrics for analytics cards.")
    public ResponseEntity<ApiResponse<SupplierKpiResponse>> getSupplierKpis() {
        SupplierKpiResponse kpis = supplierService.getSupplierKpis();
        return ResponseEntity.ok(ApiResponse.success(kpis));
    }

    // ─── Transaction Summary ─────────────────────────────────

    @GetMapping("/transactions/summary")
    @Operation(summary = "Transaction Summary", description = "Returns supplier transaction summary with monthly trends.")
    public ResponseEntity<ApiResponse<SupplierTransactionSummaryResponse>> getTransactionSummary() {
        SupplierTransactionSummaryResponse summary = supplierService.getTransactionSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
