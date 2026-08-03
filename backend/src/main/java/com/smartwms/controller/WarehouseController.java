package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.WarehouseRequest;
import com.smartwms.dto.response.WarehouseResponse;
import com.smartwms.dto.response.WarehouseStatsResponse;
import com.smartwms.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_V1 + "/warehouses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Warehouses", description = "Warehouse management endpoints — CRUD, search, soft-delete & restore")
public class WarehouseController {

    private final WarehouseService warehouseService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Warehouse", description = "Creates a new warehouse. Code must be unique; name must not be duplicated.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Warehouse created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate code or name"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> create(
            @Valid @RequestBody WarehouseRequest request) {
        log.info("POST /warehouses — code={}", request.getCode());
        WarehouseResponse response = warehouseService.createWarehouse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get Warehouse by ID", description = "Retrieves a single warehouse by its unique identifier.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> getById(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getWarehouseById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Warehouse by Code", description = "Retrieves a single warehouse by its unique code.")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getByCode(
            @Parameter(description = "Warehouse code (e.g. WH-001)") @PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getWarehouseByCode(code)));
    }

    @GetMapping("/check-code")
    @Operation(summary = "Check Code Availability", description = "Returns true if the warehouse code is available (not taken).")
    public ResponseEntity<ApiResponse<Boolean>> checkCode(
            @Parameter(description = "Warehouse code to check") @RequestParam String code,
            @Parameter(description = "Exclude this warehouse ID (for edit validation)") @RequestParam(required = false) Long excludeId) {
        boolean available = warehouseService.isCodeAvailable(code, excludeId);
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    @GetMapping
    @Operation(summary = "List Warehouses", description = "Paginated, sortable list with optional keyword search, status filter, and capacity range filter.")
    public ResponseEntity<ApiResponse<PageResponse<WarehouseResponse>>> getAll(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String direction,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Status filter (ACTIVE, INACTIVE, UNDER_MAINTENANCE)") @RequestParam(required = false) String status,
            @Parameter(description = "Minimum capacity filter") @RequestParam(required = false) Double minCapacity,
            @Parameter(description = "Maximum capacity filter") @RequestParam(required = false) Double maxCapacity) {
        PageResponse<WarehouseResponse> data = warehouseService.getAllWarehouses(
                page, size, sort, direction, search, status, minCapacity, maxCapacity);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/stats")
    @Operation(summary = "Warehouse Statistics", description = "Returns aggregate capacity statistics across all warehouses.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Stats retrieved"),
    })
    public ResponseEntity<ApiResponse<WarehouseStatsResponse>> getStats() {
        WarehouseStatsResponse stats = warehouseService.getWarehouseStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Warehouse", description = "Updates warehouse details. Code and name uniqueness are validated.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate code or name"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> update(
            @Parameter(description = "Warehouse ID") @PathVariable Long id,
            @Valid @RequestBody WarehouseRequest request) {
        log.info("PUT /warehouses/{}", id);
        WarehouseResponse response = warehouseService.updateWarehouse(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Delete ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-Delete Warehouse", description = "Soft-deletes the warehouse. Fails if warehouse still contains products.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Warehouse still has products"),
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        log.info("DELETE /warehouses/{}", id);
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    // ─── Restore ──────────────────────────────────────────────

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Warehouse", description = "Restores a soft-deleted warehouse.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse restored"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Warehouse is not deleted"),
    })
    public ResponseEntity<ApiResponse<Void>> restore(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        log.info("PATCH /warehouses/{}/restore", id);
        warehouseService.restoreWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse restored successfully"));
    }

    // ─── Status Management ────────────────────────────────────

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate Warehouse", description = "Sets the warehouse status to ACTIVE.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse activated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Warehouse is already active"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> activate(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        log.info("PATCH /warehouses/{}/activate", id);
        WarehouseResponse response = warehouseService.activateWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate Warehouse", description = "Sets the warehouse status to INACTIVE.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse deactivated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Warehouse is already inactive"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> deactivate(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        log.info("PATCH /warehouses/{}/deactivate", id);
        WarehouseResponse response = warehouseService.deactivateWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deactivated successfully", response));
    }

    @PatchMapping("/{id}/maintenance")
    @Operation(summary = "Set Warehouse to Maintenance", description = "Sets the warehouse status to UNDER_MAINTENANCE.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Warehouse set to maintenance"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Warehouse is already under maintenance"),
    })
    public ResponseEntity<ApiResponse<WarehouseResponse>> setMaintenance(
            @Parameter(description = "Warehouse ID") @PathVariable Long id) {
        log.info("PATCH /warehouses/{}/maintenance", id);
        WarehouseResponse response = warehouseService.setMaintenanceWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse set to maintenance successfully", response));
    }
}
