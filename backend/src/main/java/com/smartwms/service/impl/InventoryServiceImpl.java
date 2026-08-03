package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.InventoryTransactionType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.InventoryRequest;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.entity.InventoryTransaction;
import com.smartwms.entity.Product;
import com.smartwms.entity.Warehouse;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.InventoryMapper;
import com.smartwms.repository.InventoryTransactionRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponse createTransaction(InventoryRequest request, String performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        InventoryTransaction transaction = inventoryMapper.toEntity(request);
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setPerformedBy(performedBy != null ? performedBy : "system");

        int currentStock = product.getCurrentStock();
        int quantity = request.getQuantity();

        switch (request.getTransactionType()) {
            case STOCK_IN:
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock + quantity);
                product.setCurrentStock(currentStock + quantity);
                break;

            case STOCK_OUT:
                if (currentStock < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient stock for " + product.getSku()
                                    + ". Available: " + currentStock + ", Requested: " + quantity);
                }
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock - quantity);
                product.setCurrentStock(currentStock - quantity);
                break;

            case ADJUSTMENT:
                int adjusted = currentStock + quantity;
                if (adjusted < 0) adjusted = 0;
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(adjusted);
                product.setCurrentStock(adjusted);
                break;

            case RESERVED:
                int available = product.getAvailableStock();
                if (available < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient available stock for reservation. Available: " + available + ", Requested: " + quantity);
                }
                product.setReservedStock(product.getReservedStock() + quantity);
                transaction.setQuantityBefore(product.getReservedStock() - quantity);
                transaction.setQuantityAfter(product.getReservedStock());
                break;

            case RELEASED:
                int currentReserved = product.getReservedStock();
                if (currentReserved < quantity) {
                    throw new BusinessException(ErrorCode.PRODUCT_RESERVED_EXCEEDS_STOCK,
                            "Cannot release " + quantity + " reserved units. Only " + currentReserved + " reserved.");
                }
                product.setReservedStock(currentReserved - quantity);
                transaction.setQuantityBefore(currentReserved);
                transaction.setQuantityAfter(currentReserved - quantity);
                break;

            case DISPATCHED:
                int dispatched = product.getReservedStock();
                if (dispatched < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient reserved stock for dispatch. Reserved: " + dispatched + ", Requested: " + quantity);
                }
                product.setReservedStock(dispatched - quantity);
                product.setCurrentStock(product.getCurrentStock() - quantity);
                transaction.setQuantityBefore(dispatched);
                transaction.setQuantityAfter(dispatched - quantity);
                break;

            default:
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock);
        }

        if (request.getUnitCost() != null) {
            transaction.setUnitCost(request.getUnitCost());
            transaction.setTotalValue(request.getUnitCost().multiply(new java.math.BigDecimal(quantity)));
        }

        productRepository.save(product);
        InventoryTransaction saved = transactionRepository.save(transaction);
        log.info("Inventory transaction created: {} {} qty={} for product {} in warehouse {}",
                request.getTransactionType(), saved.getId(), quantity, product.getSku(), warehouse.getCode());
        return inventoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getTransactionById(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));
        return inventoryMapper.toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> getAllTransactions(
            int page, int size, String sort, String direction,
            Long productId, Long warehouseId, String transactionType,
            String search) {

        Sort sortObj = direction.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sort).ascending()
                : Sort.by(sort).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        Specification<InventoryTransaction> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }

            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }

            if (transactionType != null && !transactionType.isBlank()) {
                try {
                    InventoryTransactionType type = InventoryTransactionType.valueOf(transactionType.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("transactionType"), type));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("transactionType"), null));
                }
            }

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("referenceNumber")), keyword),
                    cb.like(cb.lower(root.get("reason")), keyword),
                    cb.like(cb.lower(root.get("batchNumber")), keyword)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<InventoryTransaction> txnPage = transactionRepository.findAll(spec, pageable);
        Page<InventoryResponse> responsePage = txnPage.map(inventoryMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> getTransactionsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE),
                Sort.by("transactionDate").descending());
        Page<InventoryTransaction> txnPage = transactionRepository.findByProductIdOrderByTransactionDateDesc(
                productId, pageable);
        return PageResponse.from(txnPage.map(inventoryMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> getTransactionsByWarehouse(Long warehouseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE),
                Sort.by("transactionDate").descending());
        Page<InventoryTransaction> txnPage = transactionRepository.findByWarehouseIdOrderByTransactionDateDesc(
                warehouseId, pageable);
        return PageResponse.from(txnPage.map(inventoryMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long countByProduct(Long productId) {
        return transactionRepository.countByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByWarehouse(Long warehouseId) {
        return transactionRepository.countByWarehouseId(warehouseId);
    }

    @Override
    public InventoryResponse updateTransaction(Long id, InventoryRequest request) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        // Reverse the old stock effect
        Product oldProduct = transaction.getProduct();
        int oldQty = transaction.getQuantity();
        switch (transaction.getTransactionType()) {
            case STOCK_IN:
                oldProduct.setCurrentStock(oldProduct.getCurrentStock() - oldQty);
                break;
            case STOCK_OUT:
                oldProduct.setCurrentStock(oldProduct.getCurrentStock() + oldQty);
                break;
            case ADJUSTMENT:
                // Restore: subtract the old after, add back the old before
                oldProduct.setCurrentStock(transaction.getQuantityBefore());
                break;
            case RESERVED:
                oldProduct.setReservedStock(oldProduct.getReservedStock() - oldQty);
                break;
            case RELEASED:
                oldProduct.setReservedStock(oldProduct.getReservedStock() + oldQty);
                break;
            case DISPATCHED:
                oldProduct.setReservedStock(oldProduct.getReservedStock() + oldQty);
                oldProduct.setCurrentStock(oldProduct.getCurrentStock() + oldQty);
                break;
            default:
                break;
        }
        productRepository.save(oldProduct);

        // Update transaction fields
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setQuantity(request.getQuantity());
        transaction.setReferenceNumber(request.getReferenceNumber());
        transaction.setReason(request.getReason());
        transaction.setBatchNumber(request.getBatchNumber());
        transaction.setExpiryDate(request.getExpiryDate());
        if (request.getDestinationWarehouseId() != null) {
            transaction.setDestinationWarehouseId(request.getDestinationWarehouseId());
        }

        // Apply the new stock effect
        int currentStock = product.getCurrentStock();
        int quantity = request.getQuantity();

        switch (request.getTransactionType()) {
            case STOCK_IN:
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock + quantity);
                product.setCurrentStock(currentStock + quantity);
                break;

            case STOCK_OUT:
                if (currentStock < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient stock for " + product.getSku()
                                    + ". Available: " + currentStock + ", Requested: " + quantity);
                }
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock - quantity);
                product.setCurrentStock(currentStock - quantity);
                break;

            case ADJUSTMENT:
                int adjusted = currentStock + quantity;
                if (adjusted < 0) adjusted = 0;
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(adjusted);
                product.setCurrentStock(adjusted);
                break;

            case RESERVED:
                int available = product.getAvailableStock();
                if (available < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient available stock for reservation. Available: " + available + ", Requested: " + quantity);
                }
                product.setReservedStock(product.getReservedStock() + quantity);
                transaction.setQuantityBefore(product.getReservedStock() - quantity);
                transaction.setQuantityAfter(product.getReservedStock());
                break;

            case RELEASED:
                int currentReserved = product.getReservedStock();
                if (currentReserved < quantity) {
                    throw new BusinessException(ErrorCode.PRODUCT_RESERVED_EXCEEDS_STOCK,
                            "Cannot release " + quantity + " reserved units. Only " + currentReserved + " reserved.");
                }
                product.setReservedStock(currentReserved - quantity);
                transaction.setQuantityBefore(currentReserved);
                transaction.setQuantityAfter(currentReserved - quantity);
                break;

            case DISPATCHED:
                int dispatched = product.getReservedStock();
                if (dispatched < quantity) {
                    throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                            "Insufficient reserved stock for dispatch. Reserved: " + dispatched + ", Requested: " + quantity);
                }
                product.setReservedStock(dispatched - quantity);
                product.setCurrentStock(product.getCurrentStock() - quantity);
                transaction.setQuantityBefore(dispatched);
                transaction.setQuantityAfter(dispatched - quantity);
                break;

            default:
                transaction.setQuantityBefore(currentStock);
                transaction.setQuantityAfter(currentStock);
        }

        if (request.getUnitCost() != null) {
            transaction.setUnitCost(request.getUnitCost());
            transaction.setTotalValue(request.getUnitCost().multiply(new java.math.BigDecimal(quantity)));
        }

        productRepository.save(product);
        InventoryTransaction updated = transactionRepository.save(transaction);
        log.info("Inventory transaction updated: id={}, type={}, qty={}, product={}",
                id, request.getTransactionType(), quantity, product.getSku());
        return inventoryMapper.toResponse(updated);
    }

    @Override
    public void deleteTransaction(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));
        transaction.softDelete("system");
        transactionRepository.save(transaction);
        log.info("Inventory transaction soft-deleted: id={}", id);
    }

    @Override
    public void restoreTransaction(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));
        transaction.restore();
        transactionRepository.save(transaction);
        log.info("Inventory transaction restored: id={}", id);
    }

    @Override
    public void createPoStockTransaction(Long productId, Long warehouseId, int quantity,
                                          BigDecimal unitCost, String referenceNumber,
                                          String reason, String performedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", warehouseId));

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setTransactionType(InventoryTransactionType.STOCK_IN);
        transaction.setQuantity(quantity);
        transaction.setUnitCost(unitCost);
        transaction.setReferenceNumber(referenceNumber);
        transaction.setReason(reason);
        transaction.setPerformedBy(performedBy != null ? performedBy : "system");
        transaction.setTransactionDate(LocalDateTime.now());

        int currentStock = product.getCurrentStock();
        transaction.setQuantityBefore(currentStock);
        transaction.setQuantityAfter(currentStock + quantity);

        product.setCurrentStock(currentStock + quantity);

        if (unitCost != null) {
            transaction.setTotalValue(unitCost.multiply(new java.math.BigDecimal(quantity)));
        }

        productRepository.save(product);
        transactionRepository.save(transaction);
        log.info("PO stock transaction created: qty={} for product {} in warehouse {}, ref={}",
                quantity, product.getSku(), warehouse.getCode(), referenceNumber);
    }
}
