package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ProductRequest;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.service.ProductService;
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
@RequestMapping(AppConstants.API_V1 + "/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Products", description = "Product catalog management endpoints — CRUD, search, soft-delete & restore")
public class ProductController {

    private final ProductService productService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Product", description = "Creates a new product. SKU must be unique.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate SKU or barcode"),
    })
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {
        log.info("POST /products — sku={}", request.getSku());
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get Product by ID", description = "Retrieves a single product by its unique identifier.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<ApiResponse<ProductResponse>> getById(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get Product by SKU", description = "Retrieves a single product by its unique SKU.")
    public ResponseEntity<ApiResponse<ProductResponse>> getBySku(
            @Parameter(description = "Product SKU") @PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySku(sku)));
    }

    @GetMapping("/check-sku")
    @Operation(summary = "Check SKU Availability", description = "Returns true if the SKU is available (not taken).")
    public ResponseEntity<ApiResponse<Boolean>> checkSku(
            @Parameter(description = "SKU to check") @RequestParam String sku,
            @Parameter(description = "Exclude this product ID (for edit validation)") @RequestParam(required = false) Long excludeId) {
        boolean available = productService.isSkuAvailable(sku, excludeId);
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    @GetMapping("/check-barcode")
    @Operation(summary = "Check Barcode Availability", description = "Returns true if the barcode is available.")
    public ResponseEntity<ApiResponse<Boolean>> checkBarcode(
            @Parameter(description = "Barcode to check") @RequestParam String barcode,
            @Parameter(description = "Exclude this product ID (for edit validation)") @RequestParam(required = false) Long excludeId) {
        boolean available = productService.isBarcodeAvailable(barcode, excludeId);
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    @GetMapping("/deleted")
    @Operation(summary = "Get Deleted Products", description = "Returns all soft-deleted products for admin recovery.")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getDeleted(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.getDeletedProducts(search, page, size)));
    }

    @GetMapping
    @Operation(summary = "List Products", description = "Paginated, sortable list with optional keyword search, status, category, supplier, and warehouse filters.")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String direction,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Status filter (ACTIVE, INACTIVE, DISCONTINUED)") @RequestParam(required = false) String status,
            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Supplier ID filter") @RequestParam(required = false) Long supplierId,
            @Parameter(description = "Warehouse ID filter") @RequestParam(required = false) Long warehouseId) {
        PageResponse<ProductResponse> data = productService.getAllProducts(
                page, size, sort, direction, search, status, categoryId, supplierId, warehouseId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Product", description = "Updates product details. SKU uniqueness is validated.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate SKU or barcode"),
    })
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        log.info("PUT /products/{}", id);
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Delete ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-Delete Product", description = "Soft-deletes the product.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        log.info("DELETE /products/{}", id);
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    // ─── Restore ──────────────────────────────────────────────

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Product", description = "Restores a soft-deleted product.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product restored"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<ApiResponse<Void>> restore(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        log.info("PATCH /products/{}/restore", id);
        productService.restoreProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product restored successfully"));
    }

    // ─── Status Management ────────────────────────────────────

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate Product", description = "Sets the product status to ACTIVE.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product activated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<ApiResponse<ProductResponse>> activate(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        log.info("PATCH /products/{}/activate", id);
        ProductResponse response = productService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate Product", description = "Sets the product status to INACTIVE.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deactivated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<ApiResponse<ProductResponse>> deactivate(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        log.info("PATCH /products/{}/deactivate", id);
        ProductResponse response = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", response));
    }
}
