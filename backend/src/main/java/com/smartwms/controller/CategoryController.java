package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.CategoryRequest;
import com.smartwms.dto.response.CategoryResponse;
import com.smartwms.service.CategoryService;
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

import java.util.List;

@RestController
@RequestMapping(AppConstants.API_V1 + "/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Categories", description = "Category management endpoints — hierarchical CRUD, search, soft-delete & restore")
public class CategoryController {

    private final CategoryService categoryService;

    // ─── Create ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create Category", description = "Creates a new category. Code and name must be unique.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Category created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate code or name"),
    })
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryRequest request) {
        log.info("POST /categories — code={}", request.getCode());
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.Messages.CREATED, response));
    }

    // ─── Read ─────────────────────────────────────────────────

    @GetMapping("/tree")
    @Operation(summary = "Get Category Tree", description = "Returns the full category hierarchy as a nested tree structure.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getTree() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryTree()));
    }

    @GetMapping("/deleted")
    @Operation(summary = "Get Deleted Categories", description = "Returns all soft-deleted categories for admin recovery.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getDeleted(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getDeletedCategories(search)));
    }

    @GetMapping("/{id}/path")
    @Operation(summary = "Get Category Path (Breadcrumb)", description = "Returns the ancestry path from root to the specified category.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getPath(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryPath(id)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Category by ID", description = "Retrieves a single category by its unique identifier.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
    })
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Category by Code", description = "Retrieves a single category by its unique code.")
    public ResponseEntity<ApiResponse<CategoryResponse>> getByCode(
            @Parameter(description = "Category code (e.g. ELEC)") @PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryByCode(code)));
    }

    @GetMapping("/check-code")
    @Operation(summary = "Check Code Availability", description = "Returns true if the category code is available (not taken).")
    public ResponseEntity<ApiResponse<Boolean>> checkCode(
            @Parameter(description = "Category code to check") @RequestParam String code,
            @Parameter(description = "Exclude this category ID (for edit validation)") @RequestParam(required = false) Long excludeId) {
        boolean available = categoryService.isCodeAvailable(code, excludeId);
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    @GetMapping
    @Operation(summary = "List Categories", description = "Paginated, sortable list with optional keyword search, status filter, and parent filter.")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getAll(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String direction,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Status filter (ACTIVE, INACTIVE)") @RequestParam(required = false) String status,
            @Parameter(description = "Parent category ID filter (0 = root categories only)") @RequestParam(required = false) Long parentId) {
        PageResponse<CategoryResponse> data = categoryService.getAllCategories(
                page, size, sort, direction, search, status, parentId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/roots")
    @Operation(summary = "Get Root Categories", description = "Returns all root-level categories (no parent).")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRoots() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getRootCategories()));
    }

    @GetMapping("/{parentId}/subcategories")
    @Operation(summary = "Get Sub-Categories", description = "Returns direct children of a given parent category.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSubCategories(
            @Parameter(description = "Parent category ID") @PathVariable Long parentId) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getSubCategories(parentId)));
    }

    // ─── Update ───────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update Category", description = "Updates category details. Code and name uniqueness are validated.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate code or name"),
    })
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @Parameter(description = "Category ID") @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        log.info("PUT /categories/{}", id);
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.UPDATED, response));
    }

    // ─── Delete ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-Delete Category", description = "Soft-deletes the category. Fails if it has sub-categories or products.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Category has children or products"),
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        log.info("DELETE /categories/{}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.Messages.DELETED));
    }

    // ─── Restore ──────────────────────────────────────────────

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore Category", description = "Restores a soft-deleted category.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category restored"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
    })
    public ResponseEntity<ApiResponse<Void>> restore(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        log.info("PATCH /categories/{}/restore", id);
        categoryService.restoreCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category restored successfully"));
    }

    // ─── Status Management ────────────────────────────────────

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate Category", description = "Sets the category status to ACTIVE.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category activated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
    })
    public ResponseEntity<ApiResponse<CategoryResponse>> activate(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        log.info("PATCH /categories/{}/activate", id);
        CategoryResponse response = categoryService.activateCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate Category", description = "Sets the category status to INACTIVE.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category deactivated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
    })
    public ResponseEntity<ApiResponse<CategoryResponse>> deactivate(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        log.info("PATCH /categories/{}/deactivate", id);
        CategoryResponse response = categoryService.deactivateCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deactivated successfully", response));
    }
}
