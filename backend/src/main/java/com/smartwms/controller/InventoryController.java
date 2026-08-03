package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.HistoryRequest;
import com.smartwms.dto.request.InventoryRequest;
import com.smartwms.dto.response.HistorySummaryResponse;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.service.InventoryHistoryService;
import com.smartwms.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_V1 + "/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory", description = "Inventory transaction management — stock movements, adjustments, transfers")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryHistoryService inventoryHistoryService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Inventory Transaction", description = "Records a stock movement (in, out, adjustment, transfer, reserve, release, dispatch).")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Transaction recorded"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Insufficient stock or business rule violation"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> create(
            @Valid @RequestBody InventoryRequest request) {
        log.info("POST /inventory — type={}, productId={}, qty={}",
                request.getTransactionType(), request.getProductId(), request.getQuantity());
        InventoryResponse response = inventoryService.createTransaction(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Transaction", description = "Updates an existing inventory transaction. Reverses old stock effect and applies the new one.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Transaction not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Insufficient stock or business rule violation"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> update(
            @Parameter(description = "Transaction ID") @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        log.info("PUT /inventory/{} — type={}, productId={}, qty={}",
                id, request.getTransactionType(), request.getProductId(), request.getQuantity());
        InventoryResponse response = inventoryService.updateTransaction(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get Transaction by ID", description = "Retrieves a single inventory transaction by its ID.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Transaction not found"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> getById(
            @Parameter(description = "Transaction ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getTransactionById(id)));
    }

    @GetMapping
    @Operation(summary = "List Transactions", description = "Paginated, sortable list with optional product, warehouse, type, and search filters.")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getAll(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "transactionDate") String sort,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String direction,
            @Parameter(description = "Product ID filter") @RequestParam(required = false) Long productId,
            @Parameter(description = "Warehouse ID filter") @RequestParam(required = false) Long warehouseId,
            @Parameter(description = "Transaction type filter") @RequestParam(required = false) String transactionType,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search) {
        PageResponse<InventoryResponse> data = inventoryService.getAllTransactions(
                page, size, sort, direction, productId, warehouseId, transactionType, search);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get Transactions by Product", description = "Returns paginated transactions for a specific product.")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getByProduct(
            @Parameter(description = "Product ID") @PathVariable Long productId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getTransactionsByProduct(productId, page, size)));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get Transactions by Warehouse", description = "Returns paginated transactions for a specific warehouse.")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getByWarehouse(
            @Parameter(description = "Warehouse ID") @PathVariable Long warehouseId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getTransactionsByWarehouse(warehouseId, page, size)));
    }

    @GetMapping("/count/product/{productId}")
    @Operation(summary = "Count Transactions by Product", description = "Returns total transaction count for a product.")
    public ResponseEntity<ApiResponse<Long>> countByProduct(
            @Parameter(description = "Product ID") @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.countByProduct(productId)));
    }

    @GetMapping("/count/warehouse/{warehouseId}")
    @Operation(summary = "Count Transactions by Warehouse", description = "Returns total transaction count for a warehouse.")
    public ResponseEntity<ApiResponse<Long>> countByWarehouse(
            @Parameter(description = "Warehouse ID") @PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.countByWarehouse(warehouseId)));
    }

    // ─── History ───────────────────────────────────────────────

    @GetMapping("/history")
    @Operation(summary = "Inventory History", description = "Paginated inventory history with date range, user, type, product, warehouse, and search filters.")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getHistory(
            @Parameter(description = "Start date (ISO-8601)") @RequestParam(required = false) String dateFrom,
            @Parameter(description = "End date (ISO-8601)") @RequestParam(required = false) String dateTo,
            @Parameter(description = "Performer username") @RequestParam(required = false) String performedBy,
            @Parameter(description = "Transaction type") @RequestParam(required = false) String transactionType,
            @Parameter(description = "Product ID") @RequestParam(required = false) Long productId,
            @Parameter(description = "Warehouse ID") @RequestParam(required = false) Long warehouseId,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "transactionDate") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {

        HistoryRequest request = HistoryRequest.builder()
                .dateFrom(dateFrom != null ? java.time.LocalDateTime.parse(dateFrom) : null)
                .dateTo(dateTo != null ? java.time.LocalDateTime.parse(dateTo) : null)
                .performedBy(performedBy)
                .transactionType(transactionType)
                .productId(productId)
                .warehouseId(warehouseId)
                .search(search)
                .page(page)
                .size(size)
                .sort(sort)
                .direction(direction)
                .build();

        return ResponseEntity.ok(ApiResponse.success(inventoryHistoryService.getHistory(request)));
    }

    @GetMapping("/history/summary")
    @Operation(summary = "History Summary", description = "Aggregated statistics for filtered inventory history.")
    public ResponseEntity<ApiResponse<HistorySummaryResponse>> getHistorySummary(
            @Parameter(description = "Start date (ISO-8601)") @RequestParam(required = false) String dateFrom,
            @Parameter(description = "End date (ISO-8601)") @RequestParam(required = false) String dateTo,
            @Parameter(description = "Performer username") @RequestParam(required = false) String performedBy,
            @Parameter(description = "Transaction type") @RequestParam(required = false) String transactionType,
            @Parameter(description = "Product ID") @RequestParam(required = false) Long productId,
            @Parameter(description = "Warehouse ID") @RequestParam(required = false) Long warehouseId,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search) {

        HistoryRequest request = HistoryRequest.builder()
                .dateFrom(dateFrom != null ? java.time.LocalDateTime.parse(dateFrom) : null)
                .dateTo(dateTo != null ? java.time.LocalDateTime.parse(dateTo) : null)
                .performedBy(performedBy)
                .transactionType(transactionType)
                .productId(productId)
                .warehouseId(warehouseId)
                .search(search)
                .page(0)
                .size(Integer.MAX_VALUE)
                .build();

        return ResponseEntity.ok(ApiResponse.success(inventoryHistoryService.getHistorySummary(request)));
    }

    // ─── Delete / Restore ─────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-Delete Transaction", description = "Soft-deletes an inventory transaction.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Transaction ID") @PathVariable Long id) {
        log.info("DELETE /inventory/{}", id);
        inventoryService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Transaction", description = "Restores a soft-deleted inventory transaction.")
    public ResponseEntity<ApiResponse<Void>> restore(
            @Parameter(description = "Transaction ID") @PathVariable Long id) {
        log.info("PATCH /inventory/{}/restore", id);
        inventoryService.restoreTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction restored successfully"));
    }
}
