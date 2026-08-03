package com.smartwms.service.impl;

import com.smartwms.constants.ProductStatus;
import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.constants.SupplierStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.PurchaseOrderRequest;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.entity.Product;
import com.smartwms.entity.PurchaseOrder;
import com.smartwms.entity.PurchaseOrderItem;
import com.smartwms.entity.PurchaseOrderStatusHistory;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.Warehouse;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.PurchaseOrderMapper;
import com.smartwms.mapper.PurchaseOrderUpdateMapper;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.PurchaseOrderItemRepository;
import com.smartwms.repository.PurchaseOrderRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.InventoryService;
import com.smartwms.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Implementation of {@link PurchaseOrderService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final PurchaseOrderUpdateMapper purchaseOrderUpdateMapper;
    private final InventoryService inventoryService;

    // ─── Create ───────────────────────────────────────────────

    @Override
    public PurchaseOrderResponse createOrder(PurchaseOrderRequest request) {
        log.info("Creating purchase order for supplier={}, warehouse={}", request.getSupplierId(), request.getWarehouseId());

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "ID", request.getSupplierId()));
        if (supplier.getStatus() != SupplierStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.PO_SUPPLIER_INACTIVE,
                    "Supplier '" + supplier.getName() + "' is " + supplier.getStatus());
        }
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "ID", request.getWarehouseId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(generateOrderNumber());
        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        po.setShippingCost(request.getShippingCost() != null ? request.getShippingCost() : BigDecimal.ZERO);
        po.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        po.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        po.setPaymentTerms(request.getPaymentTerms());
        po.setShippingAddress(request.getShippingAddress());
        po.setNotes(request.getNotes());
        po.setInternalNotes(request.getInternalNotes());
        po.setStatus(PurchaseOrderStatus.DRAFT);

        PurchaseOrderStatusHistory createHistory = new PurchaseOrderStatusHistory();
        createHistory.setFromStatus(null);
        createHistory.setToStatus(PurchaseOrderStatus.DRAFT);
        createHistory.setChangedBy(getCurrentUser());
        createHistory.setChangedAt(LocalDateTime.now());
        createHistory.setRemarks("Order created");
        po.addStatusHistory(createHistory);

        AtomicInteger sortOrder = new AtomicInteger(0);
        Set<Long> productIds = new HashSet<>();
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            if (!productIds.add(itemReq.getProductId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                        "Duplicate product ID " + itemReq.getProductId() + " in order items");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "ID", itemReq.getProductId()));
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BusinessException(ErrorCode.PO_PRODUCT_INACTIVE,
                        "Product '" + product.getName() + "' is " + product.getStatus());
            }

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductSku(product.getSku());
            item.setOrderedQuantity(itemReq.getOrderedQuantity());
            item.setReceivedQuantity(0);
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setTaxRate(itemReq.getTaxRate() != null ? itemReq.getTaxRate() : BigDecimal.ZERO);
            item.setDiscountAmount(itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO);
            item.setNotes(itemReq.getNotes());
            item.setSortOrder(sortOrder.getAndIncrement());
            item.calculateLineTotal();

            po.addItem(item);
        }

        po.calculateTotals();
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        log.info("Created purchase order: {}", saved.getOrderNumber());

        return purchaseOrderMapper.toResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderById(Long id) {
        PurchaseOrder po = findOrderOrThrow(id);
        return purchaseOrderMapper.toResponse(po);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderByNumber(String orderNumber) {
        PurchaseOrder po = purchaseOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "Number", orderNumber));
        return purchaseOrderMapper.toResponse(po);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderResponse> getAllOrders(
            int page, int size, String sort, String direction,
            Long supplierId, Long warehouseId, String status, String orderDateFrom, String orderDateTo, String search) {

        Sort sortObj = Sort.by(Sort.Direction.fromString(direction != null ? direction : "desc"), sort != null ? sort : "createdAt");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sortObj);

        Specification<PurchaseOrder> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (supplierId != null) {
                predicates.add(cb.equal(root.get("supplier").get("id"), supplierId));
            }
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), PurchaseOrderStatus.valueOf(status)));
            }
            if (orderDateFrom != null && !orderDateFrom.isBlank()) {
                try {
                    java.time.LocalDate from = java.time.LocalDate.parse(orderDateFrom);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("orderDate"), from));
                } catch (Exception ignored) {}
            }
            if (orderDateTo != null && !orderDateTo.isBlank()) {
                try {
                    java.time.LocalDate to = java.time.LocalDate.parse(orderDateTo);
                    predicates.add(cb.lessThanOrEqualTo(root.get("orderDate"), to));
                } catch (Exception ignored) {}
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), pattern),
                        cb.like(cb.lower(root.get("supplier").get("name")), pattern),
                        cb.like(cb.lower(root.get("supplier").get("code")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<PurchaseOrder> poPage = purchaseOrderRepository.findAll(spec, pageable);
        return PageResponse.from(poPage.map(purchaseOrderMapper::toResponse));
    }

    // ─── Update ───────────────────────────────────────────────

    @Override
    public PurchaseOrderResponse updateOrder(Long id, PurchaseOrderRequest request) {
        log.info("Updating purchase order ID={}", id);
        PurchaseOrder po = findOrderOrThrow(id);

        if (po.getStatus() != PurchaseOrderStatus.DRAFT && po.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new BusinessException(ErrorCode.PO_CANNOT_EDIT, "Only draft or pending orders can be edited");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "ID", request.getSupplierId()));
        if (supplier.getStatus() != SupplierStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.PO_SUPPLIER_INACTIVE,
                    "Supplier '" + supplier.getName() + "' is " + supplier.getStatus());
        }
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "ID", request.getWarehouseId()));

        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        po.setShippingCost(request.getShippingCost() != null ? request.getShippingCost() : BigDecimal.ZERO);
        po.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        po.setPaymentTerms(request.getPaymentTerms());
        po.setShippingAddress(request.getShippingAddress());
        po.setNotes(request.getNotes());
        po.setInternalNotes(request.getInternalNotes());

        po.getItems().clear();
        AtomicInteger sortOrder = new AtomicInteger(0);
        Set<Long> productIds = new HashSet<>();
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            if (!productIds.add(itemReq.getProductId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                        "Duplicate product ID " + itemReq.getProductId() + " in order items");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "ID", itemReq.getProductId()));
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BusinessException(ErrorCode.PO_PRODUCT_INACTIVE,
                        "Product '" + product.getName() + "' is " + product.getStatus());
            }

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductSku(product.getSku());
            item.setOrderedQuantity(itemReq.getOrderedQuantity());
            item.setReceivedQuantity(0);
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setTaxRate(itemReq.getTaxRate() != null ? itemReq.getTaxRate() : BigDecimal.ZERO);
            item.setDiscountAmount(itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO);
            item.setNotes(itemReq.getNotes());
            item.setSortOrder(sortOrder.getAndIncrement());
            item.calculateLineTotal();

            po.addItem(item);
        }

        po.calculateTotals();
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return purchaseOrderMapper.toResponse(saved);
    }

    @Override
    public PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus newStatus) {
        return updateStatus(id, newStatus, null);
    }

    @Transactional
    public PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus newStatus, String remarks) {
        log.info("Updating purchase order ID={} status to {}", id, newStatus);
        PurchaseOrder po = findOrderOrThrow(id);
        validateStatusTransition(po.getStatus(), newStatus);

        PurchaseOrderStatus oldStatus = po.getStatus();
        String currentUser = getCurrentUser();

        po.setStatus(newStatus);

        if (newStatus == PurchaseOrderStatus.APPROVED) {
            po.setApprovedBy(currentUser);
            po.setApprovedAt(LocalDateTime.now());
        }
        if (newStatus == PurchaseOrderStatus.REJECTED) {
            po.setRejectedBy(currentUser);
            po.setRejectedAt(LocalDateTime.now());
        }
        if (newStatus == PurchaseOrderStatus.CANCELLED) {
            po.setCancelledBy(currentUser);
            po.setCancelledAt(LocalDateTime.now());
        }
        if (newStatus == PurchaseOrderStatus.RECEIVED || newStatus == PurchaseOrderStatus.COMPLETED) {
            po.setReceivedBy(currentUser);
            po.setReceivedAt(LocalDateTime.now());
            if (po.getActualDeliveryDate() == null) {
                po.setActualDeliveryDate(LocalDate.now());
            }
        }

        if (newStatus == PurchaseOrderStatus.RECEIVED || newStatus == PurchaseOrderStatus.COMPLETED) {
            if (po.getInventoryAdjusted()) {
                throw new BusinessException(ErrorCode.PO_INVENTORY_ALREADY_ADJUSTED,
                        "Inventory has already been adjusted for order " + po.getOrderNumber());
            }
            for (PurchaseOrderItem item : po.getItems()) {
                int pendingQty = item.getPendingQuantity();
                if (pendingQty > 0) {
                    inventoryService.createPoStockTransaction(
                            item.getProduct().getId(),
                            po.getWarehouse().getId(),
                            pendingQty,
                            item.getUnitPrice(),
                            po.getOrderNumber(),
                            "Stock received from PO " + po.getOrderNumber(),
                            currentUser
                    );
                    item.setReceivedQuantity(item.getReceivedQuantity() + pendingQty);
                }
            }
            po.setInventoryAdjusted(true);
        }

        PurchaseOrderStatusHistory history = new PurchaseOrderStatusHistory();
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedBy(currentUser);
        history.setChangedAt(LocalDateTime.now());
        history.setRemarks(remarks);
        po.addStatusHistory(history);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return purchaseOrderMapper.toResponse(saved);
    }

    @Override
    public PurchaseOrderResponse approveOrder(Long id) {
        return updateStatus(id, PurchaseOrderStatus.APPROVED, "Approved");
    }

    @Override
    public PurchaseOrderResponse rejectOrder(Long id) {
        return updateStatus(id, PurchaseOrderStatus.REJECTED, "Rejected");
    }

    @Override
    public PurchaseOrderResponse receiveOrder(Long id) {
        return updateStatus(id, PurchaseOrderStatus.RECEIVED, "Received");
    }

    @Override
    public PurchaseOrderResponse cancelOrder(Long id) {
        return updateStatus(id, PurchaseOrderStatus.CANCELLED, "Cancelled");
    }

    // ─── Delete / Restore ─────────────────────────────────────

    @Override
    public void deleteOrder(Long id) {
        log.info("Soft-deleting purchase order ID={}", id);
        PurchaseOrder po = findOrderOrThrow(id);
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessException(ErrorCode.PO_CANNOT_DELETE, "Only draft orders can be deleted");
        }
        po.softDelete(getCurrentUser());
        purchaseOrderRepository.save(po);
    }

    @Override
    public void restoreOrder(Long id) {
        log.info("Restoring purchase order ID={}", id);
        PurchaseOrder po = purchaseOrderRepository.findByIdNative(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "ID", id));
        po.restore();
        purchaseOrderRepository.save(po);
    }

    // ─── Stats ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalOrderValue() {
        BigDecimal val = purchaseOrderRepository.sumTotalOrderValue();
        return val != null ? val : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getPendingOrderValue() {
        BigDecimal val = purchaseOrderRepository.sumPendingOrderValue();
        return val != null ? val : BigDecimal.ZERO;
    }

    // ─── Private Helpers ──────────────────────────────────────

    private PurchaseOrder findOrderOrThrow(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "ID", id));
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = purchaseOrderRepository.count();
        String orderNumber = String.format("PO-%s-%04d", dateStr, count + 1);
        int attempts = 0;
        while (purchaseOrderRepository.existsByOrderNumber(orderNumber) && attempts < 10) {
            count++;
            orderNumber = String.format("PO-%s-%04d", dateStr, count);
            attempts++;
        }
        return orderNumber;
    }

    private void validateStatusTransition(PurchaseOrderStatus current, PurchaseOrderStatus next) {
        boolean valid = switch (current) {
            case DRAFT -> next == PurchaseOrderStatus.PENDING || next == PurchaseOrderStatus.CANCELLED;
            case PENDING -> next == PurchaseOrderStatus.APPROVED || next == PurchaseOrderStatus.REJECTED || next == PurchaseOrderStatus.CANCELLED;
            case APPROVED -> next == PurchaseOrderStatus.ORDERED || next == PurchaseOrderStatus.CANCELLED;
            case ORDERED -> next == PurchaseOrderStatus.PARTIALLY_RECEIVED || next == PurchaseOrderStatus.RECEIVED || next == PurchaseOrderStatus.CANCELLED;
            case PARTIALLY_RECEIVED -> next == PurchaseOrderStatus.RECEIVED || next == PurchaseOrderStatus.COMPLETED;
            case RECEIVED -> next == PurchaseOrderStatus.COMPLETED;
            default -> false;
        };
        if (!valid) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Cannot transition from " + current + " to " + next);
        }
    }

    private String getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "system";
    }

    private Set<String> getCurrentUserRoles() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(java.util.stream.Collectors.toSet());
            }
        } catch (Exception ignored) {}
        return Set.of();
    }
}
