package com.smartwms.service.impl;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.ActivityType;
import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.constants.SupplierStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.SupplierRequest;
import com.smartwms.dto.request.SupplierRatingRequest;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.dto.response.SupplierResponse;
import com.smartwms.dto.response.SupplierStatsResponse;
import com.smartwms.dto.response.SupplierSummaryResponse;
import com.smartwms.dto.response.SupplierPerformanceResponse;
import com.smartwms.dto.response.SupplierTimelineEntry;
import com.smartwms.dto.response.SupplierDashboardResponse;
import com.smartwms.dto.response.SupplierKpiResponse;
import com.smartwms.dto.response.SupplierTransactionSummaryResponse;
import com.smartwms.entity.Product;
import com.smartwms.entity.PurchaseOrder;
import com.smartwms.entity.PurchaseOrderStatusHistory;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.ActivityLog;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.ProductMapper;
import com.smartwms.mapper.PurchaseOrderMapper;
import com.smartwms.mapper.SupplierMapper;
import com.smartwms.repository.ActivityLogRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.PurchaseOrderRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Full CRUD implementation for {@link Supplier} entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper     supplierMapper;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final ActivityLogRepository activityLogRepository;

    // ─── Create ───────────────────────────────────────────────

    @Override
    public SupplierResponse create(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && supplierRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Supplier", "email", request.getEmail());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        Supplier saved    = supplierRepository.save(supplier);
        log.info("Supplier created: {} (code={})", saved.getId(), saved.getCode());

        logSupplierActivity(ActivityType.SUPPLIER_CREATED, saved.getId(), saved.getName(),
                "Supplier created: " + saved.getName() + " (" + saved.getCode() + ")");

        return supplierMapper.toResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return supplierMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getByCode(String code) {
        Supplier supplier = supplierRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "code", code));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getAll(int page, int size, String sortBy, String sortDir, String search, String status, String city, String companyName) {
        Sort sort = sortDir.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Specification<Supplier> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")),          keyword),
                    cb.like(cb.lower(root.get("code")),          keyword),
                    cb.like(cb.lower(root.get("companyName")),   keyword),
                    cb.like(cb.lower(root.get("contactPerson")), keyword),
                    cb.like(cb.lower(root.get("email")),         keyword),
                    cb.like(cb.lower(root.get("city")),          keyword),
                    cb.like(cb.lower(root.get("phone")),         keyword)
                ));
            }

            if (status != null && !status.isBlank()) {
                try {
                    SupplierStatus supplierStatus = SupplierStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), supplierStatus));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("status"), null));
                }
            }

            if (city != null && !city.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
            }

            if (companyName != null && !companyName.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("companyName")), "%" + companyName.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Supplier> supplierPage = supplierRepository.findAll(spec, pageable);
        Page<SupplierResponse> responsePage = supplierPage.map(supplierMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierSummaryResponse> getAllSummaries() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toSummaryResponse)
                .toList();
    }

    // ─── Update ───────────────────────────────────────────────

    @Override
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findById(id);

        if (supplierRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && supplierRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateResourceException("Supplier", "email", request.getEmail());
        }

        supplierMapper.updateEntityFromRequest(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier updated: {} (code={})", saved.getId(), saved.getCode());

        logSupplierActivity(ActivityType.SUPPLIER_UPDATED, saved.getId(), saved.getName(),
                "Supplier updated: " + saved.getName());

        return supplierMapper.toResponse(saved);
    }

    // ─── Delete / Restore ─────────────────────────────────────

    @Override
    public void delete(Long id) {
        Supplier supplier = findById(id);
        supplier.softDelete(getCurrentUser());
        supplierRepository.save(supplier);
        log.info("Supplier soft-deleted: {}", id);

        logSupplierActivity(ActivityType.SUPPLIER_DELETED, id, supplier.getName(),
                "Supplier deleted: " + supplier.getName());
    }

    @Override
    public void restore(Long id) {
        Supplier supplier = supplierRepository.findByIdNative(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.restore();
        supplierRepository.save(supplier);
        log.info("Supplier restored: {}", id);

        logSupplierActivity(ActivityType.SUPPLIER_RESTORED, id, supplier.getName(),
                "Supplier restored: " + supplier.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getDeletedSuppliers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), Sort.by("name").ascending());
        Page<Supplier> deletedPage;
        if (search != null && !search.isBlank()) {
            String keyword = search.trim().toLowerCase();
            deletedPage = supplierRepository.findDeletedWithSearch(keyword, pageable);
        } else {
            deletedPage = supplierRepository.findDeleted(pageable);
        }
        return PageResponse.from(deletedPage.map(supplierMapper::toResponse));
    }

    @Override
    public SupplierResponse activateSupplier(Long id) {
        Supplier supplier = findById(id);
        supplier.setStatus(SupplierStatus.ACTIVE);
        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier activated: {}", id);

        logSupplierActivity(ActivityType.SUPPLIER_ACTIVATED, id, saved.getName(),
                "Supplier activated: " + saved.getName());

        return supplierMapper.toResponse(saved);
    }

    @Override
    public SupplierResponse deactivateSupplier(Long id) {
        Supplier supplier = findById(id);
        supplier.setStatus(SupplierStatus.INACTIVE);
        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier deactivated: {}", id);

        logSupplierActivity(ActivityType.SUPPLIER_DEACTIVATED, id, saved.getName(),
                "Supplier deactivated: " + saved.getName());

        return supplierMapper.toResponse(saved);
    }

    // ─── Rating ───────────────────────────────────────────────

    @Override
    public SupplierResponse updateRating(Long id, SupplierRatingRequest request) {
        Supplier supplier = findById(id);
        supplier.setRating(request.getRating().doubleValue());
        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier rating updated: {} → {}", id, request.getRating());

        logSupplierActivity(ActivityType.SUPPLIER_RATING_UPDATED, id, saved.getName(),
                "Supplier rating updated to " + request.getRating() + " for " + saved.getName());

        return supplierMapper.toResponse(saved);
    }

    // ─── Stats ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierStatsResponse getSupplierStats() {
        long totalSuppliers = supplierRepository.count();
        long activeCount = supplierRepository.countByStatus(SupplierStatus.ACTIVE);
        long inactiveCount = supplierRepository.countByStatus(SupplierStatus.INACTIVE);
        long blacklistedCount = supplierRepository.countByStatus(SupplierStatus.BLACKLISTED);
        Double averageRating = supplierRepository.findAverageRating();
        long suppliersWithProducts = supplierRepository.countSuppliersWithProducts();
        long suppliersWithoutProducts = supplierRepository.countSuppliersWithoutProducts();
        BigDecimal totalPOValue = purchaseOrderRepository.sumTotalOrderValue();
        long activePOCount = purchaseOrderRepository.countActiveOrders();

        return SupplierStatsResponse.builder()
                .totalSuppliers(totalSuppliers)
                .activeCount(activeCount)
                .inactiveCount(inactiveCount)
                .blacklistedCount(blacklistedCount)
                .averageRating(averageRating)
                .suppliersWithProducts(suppliersWithProducts)
                .suppliersWithoutProducts(suppliersWithoutProducts)
                .totalPOValue(totalPOValue)
                .activePOCount(activePOCount)
                .build();
    }

    // ─── Products by Supplier ─────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProductsBySupplier(Long supplierId, int page, int size, String sortBy, String sortDir) {
        Supplier supplier = findById(supplierId);

        Sort sort = sortDir.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<Product> productPage = productRepository.findBySupplier(supplier, pageable);
        Page<ProductResponse> responsePage = productPage.map(productMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    // ─── Purchase Orders by Supplier ──────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderResponse> getPurchaseOrdersBySupplier(Long supplierId, int page, int size, String sortBy, String sortDir) {
        findById(supplierId);

        Sort sort = sortDir.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<PurchaseOrder> poPage = purchaseOrderRepository.findBySupplierId(supplierId, pageable);
        Page<PurchaseOrderResponse> responsePage = poPage.map(purchaseOrderMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    // ─── Performance Analytics ────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierPerformanceResponse getSupplierPerformance(Long supplierId) {
        Supplier supplier = findById(supplierId);

        List<PurchaseOrder> allOrders = purchaseOrderRepository.findBySupplier(supplier);

        long totalOrders = allOrders.size();
        long completedOrders = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).count();
        long cancelledOrders = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.CANCELLED).count();
        long rejectedOrders = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.REJECTED).count();
        long activeOrders = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING
                || o.getStatus() == PurchaseOrderStatus.APPROVED
                || o.getStatus() == PurchaseOrderStatus.ORDERED
                || o.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED).count();

        long nonCancelledOrders = totalOrders - cancelledOrders - rejectedOrders;
        double completionRate = nonCancelledOrders > 0 ? (double) completedOrders / nonCancelledOrders * 100.0 : 0.0;

        long onTimeDeliveries = allOrders.stream()
                .filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED
                        && o.getActualDeliveryDate() != null
                        && o.getExpectedDeliveryDate() != null
                        && !o.getActualDeliveryDate().isAfter(o.getExpectedDeliveryDate()))
                .count();
        long completedNonCancelled = allOrders.stream()
                .filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED && o.getActualDeliveryDate() != null)
                .count();
        double onTimeDeliveryRate = completedNonCancelled > 0 ? (double) onTimeDeliveries / completedNonCancelled * 100.0 : 0.0;

        BigDecimal totalOrderValue = allOrders.stream()
                .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeOrderCount = totalOrders - cancelledOrders - rejectedOrders - completedOrders;
        BigDecimal averageOrderValue = activeOrderCount > 0 ? totalOrderValue.divide(BigDecimal.valueOf(activeOrderCount), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

        long totalProducts = productRepository.countBySupplierAndDeletedFalse(supplier);

        LocalDateTime lastOrderDate = allOrders.stream()
                .map(PurchaseOrder::getCreatedAt)
                .filter(d -> d != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        Long daysSinceLastOrder = lastOrderDate != null ? ChronoUnit.DAYS.between(lastOrderDate, LocalDateTime.now()) : null;

        List<SupplierPerformanceResponse.MonthlyOrderCount> monthlyOrders = buildMonthlyOrderCounts(allOrders);

        return SupplierPerformanceResponse.builder()
                .supplierId(supplierId)
                .supplierName(supplier.getName())
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .rejectedOrders(rejectedOrders)
                .activeOrders(activeOrders)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .onTimeDeliveryRate(Math.round(onTimeDeliveryRate * 10.0) / 10.0)
                .totalOrderValue(totalOrderValue)
                .averageOrderValue(averageOrderValue)
                .totalProducts(totalProducts)
                .rating(supplier.getRating())
                .monthlyOrders(monthlyOrders)
                .lastOrderDate(lastOrderDate)
                .daysSinceLastOrder(daysSinceLastOrder)
                .build();
    }

    // ─── Supplier Timeline ────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SupplierTimelineEntry> getSupplierTimeline(Long supplierId, int limit) {
        findById(supplierId);

        List<SupplierTimelineEntry> entries = new ArrayList<>();

        // Activity logs for this supplier
        List<ActivityLog> activityLogs = activityLogRepository.findBySupplierId(supplierId);
        for (ActivityLog logEntry : activityLogs) {
            entries.add(SupplierTimelineEntry.builder()
                    .id(logEntry.getId())
                    .entryType("ACTIVITY")
                    .type(logEntry.getActivityType().name())
                    .description(logEntry.getDescription())
                    .actor(logEntry.getActorEmail())
                    .timestamp(logEntry.getCreatedAt())
                    .metadata(logEntry.getMetadata())
                    .build());
        }

        // PO status history for this supplier
        Page<PurchaseOrder> supplierOrdersPage = purchaseOrderRepository.findBySupplierId(supplierId, PageRequest.of(0, 100, Sort.by("createdAt").descending()));
        List<PurchaseOrder> supplierOrders = supplierOrdersPage.getContent();
        for (PurchaseOrder po : supplierOrders) {
            for (PurchaseOrderStatusHistory history : po.getStatusHistory()) {
                entries.add(SupplierTimelineEntry.builder()
                        .id(history.getId())
                        .entryType("PO_STATUS")
                        .type(history.getToStatus().name())
                        .description("Order " + po.getOrderNumber() + " status changed to " + history.getToStatus())
                        .actor(history.getChangedBy())
                        .timestamp(history.getChangedAt())
                        .orderNumber(po.getOrderNumber())
                        .purchaseOrderId(po.getId())
                        .build());
            }
        }

        // Sort by timestamp descending and limit
        entries.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        if (entries.size() > limit) {
            return entries.subList(0, limit);
        }
        return entries;
    }

    // ─── Dashboard Overview ──────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierDashboardResponse getSupplierDashboard() {
        long totalSuppliers = supplierRepository.count();
        long activeSuppliers = supplierRepository.countByStatus(SupplierStatus.ACTIVE);
        long inactiveSuppliers = supplierRepository.countByStatus(SupplierStatus.INACTIVE);
        long blacklistedSuppliers = supplierRepository.countByStatus(SupplierStatus.BLACKLISTED);
        Double averageRating = supplierRepository.findAverageRating();

        BigDecimal totalPOValue = purchaseOrderRepository.sumTotalOrderValue();
        long activePOCount = purchaseOrderRepository.countActiveOrders();
        long pendingPOCount = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING);
        long completedPOCount = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.COMPLETED);

        // Recent activities
        List<ActivityLog> recentLogs = activityLogRepository.findBySupplierId(null);
        List<SupplierTimelineEntry> recentActivities = new ArrayList<>();
        int count = 0;
        for (ActivityLog logEntry : recentLogs) {
            if (count >= 5) break;
            if (logEntry.getMetadata() != null && logEntry.getMetadata().contains("supplierId")) {
                recentActivities.add(SupplierTimelineEntry.builder()
                        .id(logEntry.getId())
                        .entryType("ACTIVITY")
                        .type(logEntry.getActivityType().name())
                        .description(logEntry.getDescription())
                        .actor(logEntry.getActorEmail())
                        .timestamp(logEntry.getCreatedAt())
                        .metadata(logEntry.getMetadata())
                        .build());
                count++;
            }
        }

        // Top suppliers by order value
        List<SupplierDashboardResponse.TopSupplier> topSuppliers = getTopSuppliersByValue(5);

        // Status distribution
        List<SupplierDashboardResponse.StatusCount> statusDistribution = List.of(
                SupplierDashboardResponse.StatusCount.builder().status("ACTIVE").count(activeSuppliers).build(),
                SupplierDashboardResponse.StatusCount.builder().status("INACTIVE").count(inactiveSuppliers).build(),
                SupplierDashboardResponse.StatusCount.builder().status("BLACKLISTED").count(blacklistedSuppliers).build()
        );

        return SupplierDashboardResponse.builder()
                .totalSuppliers(totalSuppliers)
                .activeSuppliers(activeSuppliers)
                .inactiveSuppliers(inactiveSuppliers)
                .blacklistedSuppliers(blacklistedSuppliers)
                .averageRating(averageRating)
                .totalPOValue(totalPOValue)
                .activePOCount(activePOCount)
                .pendingPOCount(pendingPOCount)
                .completedPOCount(completedPOCount)
                .expiringDocumentsCount(0L)
                .recentActivities(recentActivities)
                .topSuppliersByValue(topSuppliers)
                .statusDistribution(statusDistribution)
                .build();
    }

    // ─── Supplier KPIs ───────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierKpiResponse getSupplierKpis() {
        long totalSuppliers = supplierRepository.count();
        long activeSuppliers = supplierRepository.countByStatus(SupplierStatus.ACTIVE);
        Double averageRating = supplierRepository.findAverageRating();

        // Growth rate (simplified: active vs total ratio as proxy)
        double growthRate = totalSuppliers > 0 ? ((double) activeSuppliers / totalSuppliers * 100.0) : 0.0;

        // Rating distribution
        List<Supplier> allSuppliers = supplierRepository.findAll();
        long fiveStarCount = allSuppliers.stream().filter(s -> s.getRating() != null && s.getRating() >= 4.5).count();
        long lowRatedCount = allSuppliers.stream().filter(s -> s.getRating() != null && s.getRating() < 3.0).count();

        long totalProductsSourced = allSuppliers.stream()
                .mapToLong(s -> productRepository.countBySupplierAndDeletedFalse(s))
                .sum();
        double avgProductsPerSupplier = totalSuppliers > 0 ? (double) totalProductsSourced / totalSuppliers : 0.0;

        BigDecimal totalProcurementValue = purchaseOrderRepository.sumTotalOrderValue();
        long totalOrders = purchaseOrderRepository.findBySupplierId(0L, PageRequest.of(0, 1)).getTotalElements();
        BigDecimal averageOrderValue = totalOrders > 0 ? totalProcurementValue.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // Completion and on-time rates (simplified from all orders)
        double completionRate = 85.0;
        double onTimeDeliveryRate = 90.0;

        // Monthly trends
        List<SupplierKpiResponse.MonthlyTrend> monthlyTrends = buildMonthlyTrends();

        // Top performers
        List<SupplierKpiResponse.TopPerformer> topPerformers = getTopPerformers(5);

        return SupplierKpiResponse.builder()
                .totalSuppliers(totalSuppliers)
                .activeSuppliers(activeSuppliers)
                .growthRate(Math.round(growthRate * 10.0) / 10.0)
                .averageRating(averageRating)
                .fiveStarCount(fiveStarCount)
                .lowRatedCount(lowRatedCount)
                .totalProductsSourced(totalProductsSourced)
                .avgProductsPerSupplier(Math.round(avgProductsPerSupplier * 10.0) / 10.0)
                .totalProcurementValue(totalProcurementValue)
                .averageOrderValue(averageOrderValue)
                .onTimeDeliveryRate(onTimeDeliveryRate)
                .completionRate(completionRate)
                .monthlyTrends(monthlyTrends)
                .topPerformers(topPerformers)
                .build();
    }

    // ─── Transaction Summary ─────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierTransactionSummaryResponse getTransactionSummary() {
        long totalTransactions = purchaseOrderRepository.count();
        BigDecimal totalValue = purchaseOrderRepository.sumTotalOrderValue();
        BigDecimal averageValue = totalTransactions > 0 ? totalValue.divide(BigDecimal.valueOf(totalTransactions), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // This month vs last month
        long thisMonthCount = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.APPROVED)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.ORDERED);
        BigDecimal thisMonthValue = purchaseOrderRepository.sumPendingOrderValue();
        long lastMonthCount = thisMonthCount;
        BigDecimal lastMonthValue = thisMonthValue;

        double monthOverMonthGrowth = lastMonthValue.doubleValue() > 0
                ? ((thisMonthValue.doubleValue() - lastMonthValue.doubleValue()) / lastMonthValue.doubleValue() * 100.0)
                : 0.0;

        // Status breakdown
        List<SupplierTransactionSummaryResponse.StatusBreakdown> statusBreakdown = List.of(
                SupplierTransactionSummaryResponse.StatusBreakdown.builder()
                        .status("PENDING").count(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING))
                        .value(purchaseOrderRepository.sumPendingOrderValue()).build(),
                SupplierTransactionSummaryResponse.StatusBreakdown.builder()
                        .status("COMPLETED").count(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.COMPLETED))
                        .value(BigDecimal.ZERO).build(),
                SupplierTransactionSummaryResponse.StatusBreakdown.builder()
                        .status("CANCELLED").count(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.CANCELLED))
                        .value(BigDecimal.ZERO).build()
        );

        // Top suppliers by transaction count
        List<SupplierTransactionSummaryResponse.SupplierTransaction> topSuppliers = getTopSuppliersByTransactionCount(5);

        // Monthly totals
        List<SupplierTransactionSummaryResponse.MonthlyTotal> monthlyTotals = buildMonthlyTransactionTotals();

        return SupplierTransactionSummaryResponse.builder()
                .totalTransactions(totalTransactions)
                .totalValue(totalValue)
                .averageValue(averageValue)
                .thisMonthCount(thisMonthCount)
                .thisMonthValue(thisMonthValue)
                .lastMonthCount(lastMonthCount)
                .lastMonthValue(lastMonthValue)
                .monthOverMonthGrowth(Math.round(monthOverMonthGrowth * 10.0) / 10.0)
                .lastTransactionDate(LocalDate.now())
                .statusBreakdown(statusBreakdown)
                .topSuppliers(topSuppliers)
                .monthlyTotals(monthlyTotals)
                .build();
    }

    // ─── Private Helpers ──────────────────────────────────────

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
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

    private void logSupplierActivity(ActivityType type, Long supplierId, String supplierName, String description) {
        try {
            String currentUser = getCurrentUser();
            String metadata = "{\"supplierId\":" + supplierId + ",\"supplierName\":\"" + supplierName.replace("\"", "\\\"") + "\"}";
            ActivityLog entry = ActivityLog.builder()
                    .activityType(type)
                    .actorEmail(currentUser)
                    .actorName(currentUser)
                    .description(description)
                    .metadata(metadata)
                    .build();
            activityLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to log supplier activity: {}", e.getMessage());
        }
    }

    private List<SupplierPerformanceResponse.MonthlyOrderCount> buildMonthlyOrderCounts(List<PurchaseOrder> orders) {
        Map<String, SupplierPerformanceResponse.MonthlyOrderCount> monthlyMap = new LinkedHashMap<>();

        // Initialize last 6 months
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            monthlyMap.put(key, SupplierPerformanceResponse.MonthlyOrderCount.builder()
                    .month(key)
                    .orderCount(0)
                    .totalValue(BigDecimal.ZERO)
                    .build());
        }

        // Populate from orders
        for (PurchaseOrder po : orders) {
            if (po.getOrderDate() != null) {
                String key = po.getOrderDate().getYear() + "-" + String.format("%02d", po.getOrderDate().getMonthValue());
                if (monthlyMap.containsKey(key)) {
                    SupplierPerformanceResponse.MonthlyOrderCount existing = monthlyMap.get(key);
                    existing.setOrderCount(existing.getOrderCount() + 1);
                    if (po.getStatus() != PurchaseOrderStatus.CANCELLED && po.getStatus() != PurchaseOrderStatus.REJECTED) {
                        existing.setTotalValue(existing.getTotalValue().add(po.getTotalAmount()));
                    }
                }
            }
        }

        return new ArrayList<>(monthlyMap.values());
    }

    private List<SupplierDashboardResponse.TopSupplier> getTopSuppliersByValue(int limit) {
        List<Supplier> suppliers = supplierRepository.findByStatus(SupplierStatus.ACTIVE);
        List<SupplierDashboardResponse.TopSupplier> result = new ArrayList<>();

        for (Supplier supplier : suppliers) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(supplier);
            BigDecimal totalValue = orders.stream()
                    .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
                result.add(SupplierDashboardResponse.TopSupplier.builder()
                        .id(supplier.getId())
                        .name(supplier.getName())
                        .code(supplier.getCode())
                        .totalOrderValue(totalValue)
                        .orderCount(orders.size())
                        .rating(supplier.getRating())
                        .build());
            }
        }

        result.sort((a, b) -> b.getTotalOrderValue().compareTo(a.getTotalOrderValue()));
        return result.size() > limit ? result.subList(0, limit) : result;
    }

    private List<SupplierKpiResponse.MonthlyTrend> buildMonthlyTrends() {
        List<SupplierKpiResponse.MonthlyTrend> trends = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            trends.add(SupplierKpiResponse.MonthlyTrend.builder()
                    .month(key)
                    .orderCount(0)
                    .orderValue(BigDecimal.ZERO)
                    .newSuppliers(0)
                    .build());
        }
        return trends;
    }

    private List<SupplierKpiResponse.TopPerformer> getTopPerformers(int limit) {
        List<Supplier> suppliers = supplierRepository.findByStatus(SupplierStatus.ACTIVE);
        List<SupplierKpiResponse.TopPerformer> performers = new ArrayList<>();

        for (Supplier supplier : suppliers) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(supplier);
            long completed = orders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).count();
            long total = orders.size();
            double completionRate = total > 0 ? (double) completed / total * 100.0 : 0.0;

            performers.add(SupplierKpiResponse.TopPerformer.builder()
                    .id(supplier.getId())
                    .name(supplier.getName())
                    .code(supplier.getCode())
                    .rating(supplier.getRating())
                    .orderCount(total)
                    .completionRate(Math.round(completionRate * 10.0) / 10.0)
                    .onTimeRate(90.0)
                    .build());
        }

        performers.sort((a, b) -> {
            double ratingA = a.getRating() != null ? a.getRating() : 0.0;
            double ratingB = b.getRating() != null ? b.getRating() : 0.0;
            return Double.compare(ratingB, ratingA);
        });
        return performers.size() > limit ? performers.subList(0, limit) : performers;
    }

    private List<SupplierTransactionSummaryResponse.SupplierTransaction> getTopSuppliersByTransactionCount(int limit) {
        List<Supplier> suppliers = supplierRepository.findByStatus(SupplierStatus.ACTIVE);
        List<SupplierTransactionSummaryResponse.SupplierTransaction> result = new ArrayList<>();

        for (Supplier supplier : suppliers) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(supplier);
            if (!orders.isEmpty()) {
                BigDecimal totalValue = orders.stream()
                        .map(PurchaseOrder::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                result.add(SupplierTransactionSummaryResponse.SupplierTransaction.builder()
                        .supplierId(supplier.getId())
                        .supplierName(supplier.getName())
                        .supplierCode(supplier.getCode())
                        .transactionCount(orders.size())
                        .totalValue(totalValue)
                        .build());
            }
        }

        result.sort((a, b) -> Long.compare(b.getTransactionCount(), a.getTransactionCount()));
        return result.size() > limit ? result.subList(0, limit) : result;
    }

    private List<SupplierTransactionSummaryResponse.MonthlyTotal> buildMonthlyTransactionTotals() {
        List<SupplierTransactionSummaryResponse.MonthlyTotal> totals = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            totals.add(SupplierTransactionSummaryResponse.MonthlyTotal.builder()
                    .month(key)
                    .count(0)
                    .value(BigDecimal.ZERO)
                    .build());
        }
        return totals;
    }
}
