package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.AuditEventType;
import com.smartwms.constants.ProductStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.ProductRequest;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.entity.Category;
import com.smartwms.entity.Product;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.Warehouse;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.ProductMapper;
import com.smartwms.repository.CategoryRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.ProductAuditService;
import com.smartwms.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductMapper productMapper;
    private final ProductAuditService productAuditService;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        String sku = request.getSku().trim().toUpperCase();
        String name = request.getName().trim();

        if (productRepository.existsBySku(sku)) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        if (request.getBarcode() != null && !request.getBarcode().isBlank()) {
            if (productRepository.existsByBarcode(request.getBarcode().trim())) {
                throw new DuplicateResourceException("Product", "barcode", request.getBarcode());
            }
        }

        Product product = productMapper.toEntity(request);
        product.setSku(sku);
        product.setName(name);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            product.setSupplier(supplier);
        }

        if (request.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));
            product.setWarehouse(warehouse);
        }

        Product saved = productRepository.save(product);
        log.info("Product created: {} (id={})", saved.getSku(), saved.getId());
        productAuditService.logEvent(saved, AuditEventType.PRODUCT_CREATED, getCurrentUser(),
                "Product created: " + saved.getName(), null, toJson(saved));
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(
            int page, int size, String sort, String direction,
            String search, String status, Long categoryId, Long supplierId, Long warehouseId) {

        Sort sortObj = direction.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sort).ascending()
                : Sort.by(sort).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        Specification<Product> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), keyword),
                    cb.like(cb.lower(root.get("sku")), keyword),
                    cb.like(cb.lower(root.get("barcode")), keyword),
                    cb.like(cb.lower(root.get("brand")), keyword)
                ));
            }

            if (status != null && !status.isBlank()) {
                try {
                    ProductStatus productStatus = ProductStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), productStatus));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("status"), null));
                }
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (supplierId != null) {
                predicates.add(cb.equal(root.get("supplier").get("id"), supplierId));
            }

            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        Page<ProductResponse> responsePage = productPage.map(productMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        String sku = request.getSku().trim().toUpperCase();
        String name = request.getName().trim();

        if (productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        if (request.getBarcode() != null && !request.getBarcode().isBlank()) {
            if (productRepository.existsByBarcodeAndIdNot(request.getBarcode().trim(), id)) {
                throw new DuplicateResourceException("Product", "barcode", request.getBarcode());
            }
        }

        String oldSku = product.getSku();
        String oldName = product.getName();
        java.math.BigDecimal oldPurchasePrice = product.getPurchasePrice();
        java.math.BigDecimal oldSellingPrice = product.getSellingPrice();

        productMapper.updateEntityFromRequest(request, product);
        product.setSku(sku);
        product.setName(name);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }

        if (request.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));
            product.setWarehouse(warehouse);
        } else {
            product.setWarehouse(null);
        }

        Product saved = productRepository.save(product);
        log.info("Product updated: {} (id={})", saved.getSku(), saved.getId());

        String oldJson = "{\"sku\":\"" + oldSku + "\",\"name\":\"" + oldName
                + "\",\"purchasePrice\":" + oldPurchasePrice
                + ",\"sellingPrice\":" + oldSellingPrice + "}";
        productAuditService.logEvent(saved, AuditEventType.PRODUCT_UPDATED, getCurrentUser(),
                "Product updated: " + saved.getName(), oldJson, toJson(saved));
        return productMapper.toResponse(saved);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Business rule: Cannot delete a product with reserved stock
        if (product.getReservedStock() != null && product.getReservedStock() > 0) {
            throw new BusinessException(ErrorCode.PRODUCT_CANNOT_DELETE_RESERVED,
                    "Cannot delete product '" + product.getSku() + "' — it has " + product.getReservedStock() + " units reserved");
        }

        // Business rule: Cannot delete a product with current stock
        if (product.getCurrentStock() != null && product.getCurrentStock() > 0) {
            throw new BusinessException(ErrorCode.PRODUCT_CANNOT_DELETE_STOCK,
                    "Cannot delete product '" + product.getSku() + "' — it has " + product.getCurrentStock() + " units in stock");
        }

        product.softDelete(getCurrentUser());
        productRepository.save(product);
        productAuditService.logEvent(product, AuditEventType.PRODUCT_DELETED, getCurrentUser(),
                "Product soft-deleted: " + product.getName(), toJson(product), null);
        log.info("Product soft-deleted: {} (id={})", product.getSku(), id);
    }

    @Override
    public void restoreProduct(Long id) {
        Product product = productRepository.findDeletedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Business rule: Check if SKU conflicts with another active product
        if (productRepository.existsBySkuAndIdNot(product.getSku(), id)) {
            throw new DuplicateResourceException("Product", "SKU", product.getSku());
        }

        product.restore();
        productRepository.save(product);
        productAuditService.logEvent(product, AuditEventType.PRODUCT_RESTORED, getCurrentUser(),
                "Product restored: " + product.getName(), null, toJson(product));
        log.info("Product restored: {} (id={})", product.getSku(), id);
    }

    @Override
    public ProductResponse activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStatus(ProductStatus.ACTIVE);
        Product saved = productRepository.save(product);
        productAuditService.logEvent(saved, AuditEventType.PRODUCT_ACTIVATED, getCurrentUser(),
                "Product activated: " + saved.getName(), "INACTIVE", "ACTIVE");
        log.info("Product activated: {} (id={})", saved.getSku(), id);
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStatus(ProductStatus.INACTIVE);
        Product saved = productRepository.save(product);
        productAuditService.logEvent(saved, AuditEventType.PRODUCT_DEACTIVATED, getCurrentUser(),
                "Product deactivated: " + saved.getName(), "ACTIVE", "INACTIVE");
        log.info("Product deactivated: {} (id={})", saved.getSku(), id);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSkuAvailable(String sku, Long excludeId) {
        String normalized = sku.trim().toUpperCase();
        if (excludeId != null) {
            return !productRepository.existsBySkuAndIdNot(normalized, excludeId);
        }
        return !productRepository.existsBySku(normalized);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBarcodeAvailable(String barcode, Long excludeId) {
        String normalized = barcode.trim();
        if (excludeId != null) {
            return !productRepository.existsByBarcodeAndIdNot(normalized, excludeId);
        }
        return !productRepository.existsByBarcode(normalized);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getDeletedProducts(String search, int page, int size) {
        Sort sortObj = Sort.by("name").ascending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        List<Product> allDeleted;
        if (search != null && !search.isBlank()) {
            allDeleted = productRepository.findDeletedByKeyword(search.trim());
        } else {
            allDeleted = productRepository.findAllDeleted();
        }

        // Manual pagination since native query doesn't support Spring Data pagination directly
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allDeleted.size());
        List<Product> pageContent = start < allDeleted.size()
                ? allDeleted.subList(start, end)
                : java.util.Collections.emptyList();

        Page<Product> deletedPage = new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, allDeleted.size());
        Page<ProductResponse> responsePage = deletedPage.map(productMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    // ─── Stock-related methods consumed by Inventory module ──────

    @Override
    @Transactional(readOnly = true)
    public int getCurrentStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getCurrentStock();
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getAvailableStock();
    }

    @Override
    @Transactional(readOnly = true)
    public int getReservedStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getReservedStock();
    }

    @Override
    @Transactional(readOnly = true)
    public int getReorderLevel(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getReorderLevel();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasSufficientStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getAvailableStock() >= quantity;
    }

    // ─── Audit Helpers ─────────────────────────────────────────

    private String getCurrentUser() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "system";
    }

    private String toJson(Product product) {
        if (product == null) return null;
        return "{"
                + "\"id\":" + product.getId()
                + ",\"sku\":\"" + escapeJson(product.getSku()) + "\""
                + ",\"name\":\"" + escapeJson(product.getName()) + "\""
                + ",\"status\":\"" + product.getStatus() + "\""
                + ",\"purchasePrice\":" + product.getPurchasePrice()
                + ",\"sellingPrice\":" + product.getSellingPrice()
                + ",\"currentStock\":" + product.getCurrentStock()
                + ",\"reservedStock\":" + product.getReservedStock()
                + ",\"categoryId\":" + (product.getCategory() != null ? product.getCategory().getId() : "null")
                + ",\"supplierId\":" + (product.getSupplier() != null ? product.getSupplier().getId() : "null")
                + ",\"warehouseId\":" + (product.getWarehouse() != null ? product.getWarehouse().getId() : "null")
                + "}";
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
