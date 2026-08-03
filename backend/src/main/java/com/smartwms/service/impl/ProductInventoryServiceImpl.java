package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.StockStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.InventorySummaryResponse;
import com.smartwms.dto.response.StockAdjustmentResponse;
import com.smartwms.entity.Product;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.InventorySummaryMapper;
import com.smartwms.repository.ProductRepository;
import com.smartwms.service.ProductInventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductInventoryServiceImpl implements ProductInventoryService {

    private final ProductRepository productRepository;
    private final InventorySummaryMapper inventorySummaryMapper;

    @Override
    public StockAdjustmentResponse adjustStock(Long productId, int quantityChange, String reason, String performedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int previousStock = product.getCurrentStock();
        int newStock = previousStock + quantityChange;

        if (newStock < 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Stock cannot go below zero. Available: " + previousStock + ", requested change: " + quantityChange);
        }

        product.setCurrentStock(newStock);
        productRepository.save(product);

        log.info("Stock adjusted for product {}: {} -> {} (change: {}, reason: {}, by: {})",
                product.getSku(), previousStock, newStock, quantityChange, reason, performedBy);

        return StockAdjustmentResponse.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .previousStock(previousStock)
                .newStock(newStock)
                .quantityChanged(quantityChange)
                .reason(reason)
                .adjustedAt(LocalDateTime.now())
                .adjustedBy(performedBy)
                .build();
    }

    @Override
    public StockAdjustmentResponse reserveStock(Long productId, int quantity, String performedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int available = product.getAvailableStock();
        if (quantity > available) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Insufficient available stock. Available: " + available + ", requested: " + quantity);
        }

        int previousReserved = product.getReservedStock();
        product.setReservedStock(previousReserved + quantity);
        productRepository.save(product);

        log.info("Stock reserved for product {}: {} -> {} (qty: {}, by: {})",
                product.getSku(), previousReserved, product.getReservedStock(), quantity, performedBy);

        return StockAdjustmentResponse.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .previousStock(previousReserved)
                .newStock(product.getReservedStock())
                .quantityChanged(quantity)
                .reason("RESERVATION")
                .adjustedAt(LocalDateTime.now())
                .adjustedBy(performedBy)
                .build();
    }

    @Override
    public StockAdjustmentResponse releaseReservedStock(Long productId, int quantity, String performedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int previousReserved = product.getReservedStock();
        int newReserved = Math.max(0, previousReserved - quantity);
        product.setReservedStock(newReserved);
        productRepository.save(product);

        log.info("Reserved stock released for product {}: {} -> {} (qty: {}, by: {})",
                product.getSku(), previousReserved, newReserved, quantity, performedBy);

        return StockAdjustmentResponse.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .previousStock(previousReserved)
                .newStock(newReserved)
                .quantityChanged(-quantity)
                .reason("RELEASE_RESERVATION")
                .adjustedAt(LocalDateTime.now())
                .adjustedBy(performedBy)
                .build();
    }

    @Override
    public StockAdjustmentResponse confirmDispatch(Long productId, int quantity, String performedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int previousReserved = product.getReservedStock();
        if (quantity > previousReserved) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Dispatch quantity exceeds reserved stock. Reserved: " + previousReserved + ", dispatch: " + quantity);
        }

        int previousStock = product.getCurrentStock();
        product.setCurrentStock(previousStock - quantity);
        product.setReservedStock(previousReserved - quantity);
        productRepository.save(product);

        log.info("Dispatch confirmed for product {}: stock {} -> {}, reserved {} -> {} (by: {})",
                product.getSku(), previousStock, product.getCurrentStock(),
                previousReserved, product.getReservedStock(), performedBy);

        return StockAdjustmentResponse.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .previousStock(previousStock)
                .newStock(product.getCurrentStock())
                .quantityChanged(-quantity)
                .reason("DISPATCH")
                .adjustedAt(LocalDateTime.now())
                .adjustedBy(performedBy)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventorySummaryResponse> getInventorySummary(
            int page, int size, String sort, String direction,
            Long warehouseId, StockStatus stockStatus) {

        Sort sortObj = direction.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sort).ascending()
                : Sort.by(sort).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        Specification<Product> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }

            // Stock status filtering
            if (stockStatus != null) {
                switch (stockStatus) {
                    case OUT_OF_STOCK -> predicates.add(cb.lessThanOrEqualTo(root.get("currentStock"), 0));
                    case LOW_STOCK -> predicates.add(cb.and(
                            cb.greaterThan(root.get("currentStock"), 0),
                            cb.lessThanOrEqualTo(root.get("currentStock"), root.get("reorderLevel"))
                    ));
                    case IN_STOCK -> predicates.add(cb.greaterThan(root.get("currentStock"), root.get("reorderLevel")));
                    case OVERSTOCKED -> predicates.add(cb.greaterThan(root.get("currentStock"), root.get("reorderLevel")));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        Page<InventorySummaryResponse> responsePage = productPage.map(inventorySummaryMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public InventorySummaryResponse getProductInventory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return inventorySummaryMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventorySummaryResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(inventorySummaryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventorySummaryResponse> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts().stream()
                .map(inventorySummaryMapper::toResponse)
                .toList();
    }

    @Override
    public StockStatus calculateStockStatus(int currentStock, int reorderLevel) {
        if (currentStock <= 0) return StockStatus.OUT_OF_STOCK;
        if (currentStock <= reorderLevel) return StockStatus.LOW_STOCK;
        if (reorderLevel > 0 && currentStock > reorderLevel * 3) return StockStatus.OVERSTOCKED;
        return StockStatus.IN_STOCK;
    }
}
