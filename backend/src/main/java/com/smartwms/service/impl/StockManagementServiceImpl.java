package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.InventoryTransactionType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.StockAdjustRequest;
import com.smartwms.dto.request.StockInRequest;
import com.smartwms.dto.request.StockOutRequest;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.dto.response.StockLevelResponse;
import com.smartwms.entity.Product;
import com.smartwms.entity.Warehouse;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.repository.InventoryTransactionRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.InventoryService;
import com.smartwms.service.StockManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockManagementServiceImpl implements StockManagementService {

    private final InventoryService inventoryService;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    public InventoryResponse stockIn(StockInRequest request, String performedBy) {
        var invRequest = new com.smartwms.dto.request.InventoryRequest();
        invRequest.setProductId(request.getProductId());
        invRequest.setWarehouseId(request.getWarehouseId());
        invRequest.setTransactionType(InventoryTransactionType.STOCK_IN);
        invRequest.setQuantity(request.getQuantity());
        invRequest.setUnitCost(request.getUnitCost());
        invRequest.setReferenceNumber(request.getReferenceNumber());
        invRequest.setBatchNumber(request.getBatchNumber());
        invRequest.setReason(request.getReason());

        InventoryResponse response = inventoryService.createTransaction(invRequest, performedBy);
        log.info("Stock In: qty={} product={} warehouse={} by={}",
                request.getQuantity(), request.getProductId(), request.getWarehouseId(), performedBy);
        return response;
    }

    @Override
    public InventoryResponse stockOut(StockOutRequest request, String performedBy) {
        var invRequest = new com.smartwms.dto.request.InventoryRequest();
        invRequest.setProductId(request.getProductId());
        invRequest.setWarehouseId(request.getWarehouseId());
        invRequest.setTransactionType(InventoryTransactionType.STOCK_OUT);
        invRequest.setQuantity(request.getQuantity());
        invRequest.setReferenceNumber(request.getReferenceNumber());
        invRequest.setReason(request.getReason());

        InventoryResponse response = inventoryService.createTransaction(invRequest, performedBy);
        log.info("Stock Out: qty={} product={} warehouse={} by={}",
                request.getQuantity(), request.getProductId(), request.getWarehouseId(), performedBy);
        return response;
    }

    @Override
    public InventoryResponse adjustStock(StockAdjustRequest request, String performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        int currentStock = product.getCurrentStock();
        int actualCount = request.getActualCount();
        int difference = actualCount - currentStock;

        if (difference == 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Stock is already at the actual count (" + currentStock + "). No adjustment needed.");
        }

        var invRequest = new com.smartwms.dto.request.InventoryRequest();
        invRequest.setProductId(request.getProductId());
        invRequest.setWarehouseId(request.getWarehouseId());
        invRequest.setTransactionType(InventoryTransactionType.ADJUSTMENT);
        invRequest.setQuantity(Math.abs(difference));
        invRequest.setReason((request.getReason() != null ? request.getReason() + " — " : "")
                + "Physical count: " + actualCount + ", System count: " + currentStock);

        InventoryResponse response = inventoryService.createTransaction(invRequest, performedBy);
        log.info("Stock Adjust: product={} from {} to {} (diff={}) by={}",
                request.getProductId(), currentStock, actualCount, difference, performedBy);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public StockLevelResponse getStockLevel(Long productId, Long warehouseId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", warehouseId));

        long txnCount = transactionRepository.countByProductId(productId);

        return StockLevelResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .warehouseId(warehouse.getId())
                .warehouseName(warehouse.getName())
                .currentStock(product.getCurrentStock())
                .reservedStock(product.getReservedStock())
                .availableStock(product.getAvailableStock())
                .reorderLevel(product.getReorderLevel())
                .lowStock(product.isLowStock())
                .outOfStock(product.isOutOfStock())
                .totalValue(product.getCurrentStock() > 0 && product.getSellingPrice() != null
                        ? product.getSellingPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()))
                        : BigDecimal.ZERO)
                .transactionCount(txnCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> getStockLevelsByWarehouse(Long warehouseId, int page, int size) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", warehouseId));

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE),
                Sort.by("currentStock").descending());

        Page<Product> productPage = productRepository.findByWarehouse(warehouse, pageable);

        List<StockLevelResponse> levels = productPage.getContent().stream()
                .map(p -> buildStockLevel(p, warehouse))
                .toList();

        Page<StockLevelResponse> resultPage = new PageImpl<>(levels, pageable, productPage.getTotalElements());
        return PageResponse.from(resultPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> getStockLevelsByProduct(Long productId, int page, int size) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE),
                Sort.by("currentStock").descending());

        // Since product has a single warehouse, build one stock level entry
        if (product.getWarehouse() != null) {
            long txnCount = transactionRepository.countByProductId(productId);
            StockLevelResponse level = StockLevelResponse.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .warehouseId(product.getWarehouse().getId())
                    .warehouseName(product.getWarehouse().getName())
                    .currentStock(product.getCurrentStock())
                    .reservedStock(product.getReservedStock())
                    .availableStock(product.getAvailableStock())
                    .reorderLevel(product.getReorderLevel())
                    .lowStock(product.isLowStock())
                    .outOfStock(product.isOutOfStock())
                    .totalValue(product.getCurrentStock() > 0 && product.getSellingPrice() != null
                            ? product.getSellingPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()))
                            : BigDecimal.ZERO)
                    .transactionCount(txnCount)
                    .build();

            List<StockLevelResponse> list = List.of(level);
            Page<StockLevelResponse> resultPage = new PageImpl<>(list, pageable, 1);
            return PageResponse.from(resultPage);
        }

        return PageResponse.from(new PageImpl<>(List.of(), pageable, 0));
    }

    private StockLevelResponse buildStockLevel(Product product, Warehouse warehouse) {
        long txnCount = transactionRepository.countByProductId(product.getId());
        return StockLevelResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .warehouseId(warehouse.getId())
                .warehouseName(warehouse.getName())
                .currentStock(product.getCurrentStock())
                .reservedStock(product.getReservedStock())
                .availableStock(product.getAvailableStock())
                .reorderLevel(product.getReorderLevel())
                .lowStock(product.isLowStock())
                .outOfStock(product.isOutOfStock())
                .totalValue(product.getCurrentStock() > 0 && product.getSellingPrice() != null
                        ? product.getSellingPrice().multiply(BigDecimal.valueOf(product.getCurrentStock()))
                        : BigDecimal.ZERO)
                .transactionCount(txnCount)
                .build();
    }
}
