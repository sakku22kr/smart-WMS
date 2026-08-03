package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.PurchaseOrderRequest;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Purchase Order management.
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/purchase-orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Purchase Orders", description = "Purchase order management — create, update, approve, receive, cancel")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Purchase Order", description = "Creates a new purchase order with line items.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> create(
            @Valid @RequestBody PurchaseOrderRequest request) {
        log.info("POST /purchase-orders — supplier={}, items={}", request.getSupplierId(), request.getItems().size());
        PurchaseOrderResponse response = purchaseOrderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getById(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getOrderById(id)));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get Purchase Order by Number")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getByNumber(
            @Parameter(description = "Order Number") @PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getOrderByNumber(orderNumber)));
    }

    @GetMapping
    @Operation(summary = "List Purchase Orders", description = "Paginated list with filters.")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderResponse>>> getAll(
            @Parameter(description = "Page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction,
            @Parameter(description = "Supplier ID") @RequestParam(required = false) Long supplierId,
            @Parameter(description = "Warehouse ID") @RequestParam(required = false) Long warehouseId,
            @Parameter(description = "Status") @RequestParam(required = false) String status,
            @Parameter(description = "Order date from (yyyy-MM-dd)") @RequestParam(required = false) String orderDateFrom,
            @Parameter(description = "Order date to (yyyy-MM-dd)") @RequestParam(required = false) String orderDateTo,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(
                purchaseOrderService.getAllOrders(page, size, sort, direction, supplierId, warehouseId, status, orderDateFrom, orderDateTo, search)));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Purchase Order", description = "Updates a draft/pending purchase order.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> update(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderRequest request) {
        log.info("PUT /purchase-orders/{}", id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, purchaseOrderService.updateOrder(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Order Status")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updateStatus(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id,
            @Parameter(description = "New Status") @RequestParam PurchaseOrderStatus status) {
        log.info("PATCH /purchase-orders/{}/status → {}", id, status);
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve Purchase Order")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> approve(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("PATCH /purchase-orders/{}/approve", id);
        return ResponseEntity.ok(ApiResponse.success("Order approved", purchaseOrderService.approveOrder(id)));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject Purchase Order")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> reject(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("PATCH /purchase-orders/{}/reject", id);
        return ResponseEntity.ok(ApiResponse.success("Order rejected", purchaseOrderService.rejectOrder(id)));
    }

    @PatchMapping("/{id}/receive")
    @Operation(summary = "Receive Purchase Order", description = "Marks order as received/completed.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> receive(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("PATCH /purchase-orders/{}/receive", id);
        return ResponseEntity.ok(ApiResponse.success("Order received", purchaseOrderService.receiveOrder(id)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel Purchase Order")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> cancel(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("PATCH /purchase-orders/{}/cancel", id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", purchaseOrderService.cancelOrder(id)));
    }

    // ─── Delete / Restore ─────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Purchase Order", description = "Soft-deletes a draft purchase order.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("DELETE /purchase-orders/{}", id);
        purchaseOrderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Purchase Order")
    public ResponseEntity<ApiResponse<Void>> restore(
            @Parameter(description = "Purchase Order ID") @PathVariable Long id) {
        log.info("PATCH /purchase-orders/{}/restore", id);
        purchaseOrderService.restoreOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order restored"));
    }

    // ─── Stats ────────────────────────────────────────────────

    @GetMapping("/stats/count")
    @Operation(summary = "Count by Status")
    public ResponseEntity<ApiResponse<Long>> countByStatus(
            @Parameter(description = "Status") @RequestParam PurchaseOrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.countByStatus(status)));
    }

    @GetMapping("/stats/total-value")
    @Operation(summary = "Total Order Value")
    public ResponseEntity<ApiResponse<java.math.BigDecimal>> totalValue() {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getTotalOrderValue()));
    }

    @GetMapping("/stats/pending-value")
    @Operation(summary = "Pending Order Value")
    public ResponseEntity<ApiResponse<java.math.BigDecimal>> pendingValue() {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPendingOrderValue()));
    }
}
