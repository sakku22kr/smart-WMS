package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.StockAdjustRequest;
import com.smartwms.dto.request.StockInRequest;
import com.smartwms.dto.request.StockOutRequest;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.dto.response.StockLevelResponse;
import com.smartwms.service.StockManagementService;
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
@RequestMapping(AppConstants.API_V1 + "/stock")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Management", description = "Quick stock operations — receive, dispatch, adjust, and query stock levels")
public class StockManagementController {

    private final StockManagementService stockManagementService;

    // ─── Stock In ─────────────────────────────────────────────

    @PostMapping("/in")
    @Operation(summary = "Stock In", description = "Receive stock into a warehouse. Creates a STOCK_IN transaction.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Stock received"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product or warehouse not found"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> stockIn(
            @Valid @RequestBody StockInRequest request) {
        log.info("POST /stock/in — productId={}, qty={}", request.getProductId(), request.getQuantity());
        InventoryResponse response = stockManagementService.stockIn(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock received successfully", response));
    }

    // ─── Stock Out ────────────────────────────────────────────

    @PostMapping("/out")
    @Operation(summary = "Stock Out", description = "Dispatch stock from a warehouse. Validates sufficient stock. Creates a STOCK_OUT transaction.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Stock dispatched"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product or warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Insufficient stock"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> stockOut(
            @Valid @RequestBody StockOutRequest request) {
        log.info("POST /stock/out — productId={}, qty={}", request.getProductId(), request.getQuantity());
        InventoryResponse response = stockManagementService.stockOut(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock dispatched successfully", response));
    }

    // ─── Stock Adjustment ─────────────────────────────────────

    @PostMapping("/adjust")
    @Operation(summary = "Adjust Stock", description = "Adjust stock to match a physical count. Computes the difference and records an ADJUSTMENT transaction.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Stock adjusted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed or no adjustment needed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product or warehouse not found"),
    })
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @Valid @RequestBody StockAdjustRequest request) {
        log.info("POST /stock/adjust — productId={}, actualCount={}", request.getProductId(), request.getActualCount());
        InventoryResponse response = stockManagementService.adjustStock(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock adjusted successfully", response));
    }

    // ─── Stock Level Queries ──────────────────────────────────

    @GetMapping("/level/{productId}/{warehouseId}")
    @Operation(summary = "Get Stock Level", description = "Returns the current stock level for a specific product in a specific warehouse.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Stock level found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product or warehouse not found"),
    })
    public ResponseEntity<ApiResponse<StockLevelResponse>> getStockLevel(
            @Parameter(description = "Product ID") @PathVariable Long productId,
            @Parameter(description = "Warehouse ID") @PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(
                stockManagementService.getStockLevel(productId, warehouseId)));
    }

    @GetMapping("/levels/warehouse/{warehouseId}")
    @Operation(summary = "Stock Levels by Warehouse", description = "Returns paginated stock levels for all products in a warehouse.")
    public ResponseEntity<ApiResponse<PageResponse<StockLevelResponse>>> getStockLevelsByWarehouse(
            @Parameter(description = "Warehouse ID") @PathVariable Long warehouseId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                stockManagementService.getStockLevelsByWarehouse(warehouseId, page, size)));
    }

    @GetMapping("/levels/product/{productId}")
    @Operation(summary = "Stock Levels by Product", description = "Returns stock level info for a product across warehouses.")
    public ResponseEntity<ApiResponse<PageResponse<StockLevelResponse>>> getStockLevelsByProduct(
            @Parameter(description = "Product ID") @PathVariable Long productId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                stockManagementService.getStockLevelsByProduct(productId, page, size)));
    }
}
