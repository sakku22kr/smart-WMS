package com.smartwms.service.impl;

import com.smartwms.constants.CategoryStatus;
import com.smartwms.constants.ProductStatus;
import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.constants.SupplierStatus;
import com.smartwms.constants.WarehouseStatus;
import com.smartwms.dto.response.DashboardPurchaseOrderResponse;
import com.smartwms.dto.response.DashboardStatsResponse;
import com.smartwms.dto.response.InventoryValueResponse;
import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.dto.response.ProductStatisticsResponse;
import com.smartwms.dto.response.TopProductResponse;
import com.smartwms.entity.Product;
import com.smartwms.mapper.DashboardMapper;
import com.smartwms.repository.CategoryRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.repository.PurchaseOrderRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.repository.WarehouseRepository;
import com.smartwms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Computes aggregated KPI stats and alert lists for the main dashboard.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository   productRepository;
    private final CategoryRepository  categoryRepository;
    private final SupplierRepository  supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final DashboardMapper     dashboardMapper;

    // ─── Stats ────────────────────────────────────────────────

    @Override
    public DashboardStatsResponse getStats() {
        log.debug("Computing dashboard stats");

        long totalProducts       = productRepository.count();
        long activeProducts      = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactiveProducts    = productRepository.countByStatus(ProductStatus.INACTIVE);
        long discontinuedProducts= productRepository.countByStatus(ProductStatus.DISCONTINUED);
        long lowStockProducts    = productRepository.findLowStockProducts().size();
        long outOfStockProducts  = productRepository.findOutOfStockProducts().size();
        long totalCurrentStock   = productRepository.sumCurrentStock();

        long totalCategories  = categoryRepository.count();
        long activeCategories = categoryRepository.countByStatus(CategoryStatus.ACTIVE);
        long inactiveCategories = categoryRepository.countByStatus(CategoryStatus.INACTIVE);
        long rootCategories = categoryRepository.countByParentIsNull();
        long maxDepth = computeMaxCategoryDepth(categoryRepository.findAllOrdering());
        long totalProductCount = productRepository.count();
        long avgProductsPerCat = totalCategories > 0 ? totalProductCount / totalCategories : 0;

        long totalSuppliers  = supplierRepository.count();
        long activeSuppliers = supplierRepository.countByStatus(SupplierStatus.ACTIVE);

        long totalWarehouses  = warehouseRepository.count();
        long activeWarehouses = warehouseRepository.countByStatus(WarehouseStatus.ACTIVE);
        long inactiveWarehouses = warehouseRepository.countByStatus(WarehouseStatus.INACTIVE);
        long maintenanceWarehouses = warehouseRepository.countByStatus(WarehouseStatus.UNDER_MAINTENANCE);

        Double totalCapacity = warehouseRepository.sumCapacity();
        Double totalUtilized = warehouseRepository.sumCurrentUtilization();
        Double utilizationPercent = 0.0;
        if (totalCapacity != null && totalCapacity > 0) {
            utilizationPercent = Math.round((totalUtilized / totalCapacity) * 1000.0) / 10.0;
        }
        long warehousesNearCapacity = warehouseRepository.countNearCapacity();
        long warehousesFull = warehouseRepository.countFull();

        // Purchase Order stats
        long totalOrders      = purchaseOrderRepository.count();
        long pendingOrders    = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING);
        long approvedOrders   = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.APPROVED)
                              + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.ORDERED)
                              + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        long rejectedOrders   = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.REJECTED);
        long completedOrders  = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.RECEIVED)
                              + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.COMPLETED);
        long cancelledOrders  = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.CANCELLED);
        java.math.BigDecimal totalOrderValue   = purchaseOrderRepository.sumTotalOrderValue();
        java.math.BigDecimal pendingOrderValue = purchaseOrderRepository.sumPendingOrderValue();

        return DashboardStatsResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .discontinuedProducts(discontinuedProducts)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .totalCurrentStock(totalCurrentStock)
                .totalCategories(totalCategories)
                .activeCategories(activeCategories)
                .inactiveCategories(inactiveCategories)
                .rootCategories(rootCategories)
                .maxCategoryDepth(maxDepth)
                .avgProductsPerCategory(avgProductsPerCat)
                .totalSuppliers(totalSuppliers)
                .activeSuppliers(activeSuppliers)
                .totalWarehouses(totalWarehouses)
                .activeWarehouses(activeWarehouses)
                .inactiveWarehouses(inactiveWarehouses)
                .maintenanceWarehouses(maintenanceWarehouses)
                .totalWarehouseCapacity(totalCapacity)
                .totalWarehouseUtilized(totalUtilized)
                .warehouseUtilizationPercent(utilizationPercent)
                .warehousesNearCapacity(warehousesNearCapacity)
                .warehousesFull(warehousesFull)
                .totalInventoryValue(productRepository.sumInventoryValue())
                .averageSellingPrice(productRepository.avgSellingPrice())
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .approvedOrders(approvedOrders)
                .rejectedOrders(rejectedOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .totalOrderValue(totalOrderValue != null ? totalOrderValue : java.math.BigDecimal.ZERO)
                .pendingOrderValue(pendingOrderValue != null ? pendingOrderValue : java.math.BigDecimal.ZERO)
                .build();
    }

    // ─── Low Stock / Out of Stock ─────────────────────────────

    @Override
    public List<LowStockProductResponse> getLowStockProducts() {
        log.debug("Fetching low-stock products");
        return dashboardMapper.toLowStockList(productRepository.findLowStockProducts());
    }

    @Override
    public List<LowStockProductResponse> getOutOfStockProducts() {
        log.debug("Fetching out-of-stock products");
        return dashboardMapper.toLowStockList(productRepository.findOutOfStockProducts());
    }

    // ─── Top Products ────────────────────────────────────────

    @Override
    public List<TopProductResponse> getTopProducts(int limit) {
        log.debug("Fetching top {} products by stock", limit);
        List<Product> products = productRepository.findTopProductsByStock(
                org.springframework.data.domain.PageRequest.of(0, limit));
        return products.stream()
                .map(p -> TopProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .category(p.getCategory() != null ? p.getCategory().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .inventoryValue(p.getSellingPrice() != null ?
                                p.getSellingPrice().multiply(java.math.BigDecimal.valueOf(p.getCurrentStock())) :
                                java.math.BigDecimal.ZERO)
                        .build())
                .toList();
    }

    // ─── Product Statistics ──────────────────────────────────

    @Override
    public ProductStatisticsResponse getProductStatistics() {
        log.debug("Computing product statistics");

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactiveProducts = productRepository.countByStatus(ProductStatus.INACTIVE);
        long discontinuedProducts = productRepository.countByStatus(ProductStatus.DISCONTINUED);
        long lowStockProducts = productRepository.findLowStockProducts().size();
        long outOfStockProducts = productRepository.findOutOfStockProducts().size();
        long totalStockQuantity = productRepository.sumCurrentStock();
        java.math.BigDecimal totalInventoryValue = productRepository.sumInventoryValue();
        java.math.BigDecimal avgSellingPrice = productRepository.avgSellingPrice();

        // Stock distribution
        java.util.List<ProductStatisticsResponse.StockDistributionItem> stockDistribution = java.util.List.of(
                ProductStatisticsResponse.StockDistributionItem.builder()
                        .label("In Stock").count(totalProducts - lowStockProducts - outOfStockProducts - discontinuedProducts).color("#22c55e").build(),
                ProductStatisticsResponse.StockDistributionItem.builder()
                        .label("Low Stock").count(lowStockProducts).color("#f97316").build(),
                ProductStatisticsResponse.StockDistributionItem.builder()
                        .label("Out of Stock").count(outOfStockProducts).color("#ef4444").build(),
                ProductStatisticsResponse.StockDistributionItem.builder()
                        .label("Discontinued").count(discontinuedProducts).color("#6366f1").build()
        );

        // Products by category
        java.util.List<ProductStatisticsResponse.CategoryProductCount> productsByCategory =
                productRepository.countProductsByCategory().stream()
                        .map(row -> ProductStatisticsResponse.CategoryProductCount.builder()
                                .categoryName((String) row[0])
                                .productCount((Long) row[1])
                                .totalValue(java.math.BigDecimal.ZERO)
                                .build())
                        .toList();

        return ProductStatisticsResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .discontinuedProducts(discontinuedProducts)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .totalStockQuantity(totalStockQuantity)
                .totalInventoryValue(totalInventoryValue)
                .averageSellingPrice(avgSellingPrice)
                .stockDistribution(stockDistribution)
                .productsByCategory(productsByCategory)
                .build();
    }

    // ─── Inventory Value ─────────────────────────────────────

    @Override
    public InventoryValueResponse getInventoryValue() {
        log.debug("Computing inventory value breakdown");

        java.math.BigDecimal totalValue = productRepository.sumInventoryValue();

        java.util.List<InventoryValueResponse.CategoryValueItem> valueByCategory =
                productRepository.sumValueByCategory().stream()
                        .map(row -> InventoryValueResponse.CategoryValueItem.builder()
                                .categoryName((String) row[0])
                                .value((java.math.BigDecimal) row[1])
                                .productCount(0L)
                                .build())
                        .toList();

        return InventoryValueResponse.builder()
                .totalInventoryValue(totalValue)
                .totalStockValue(totalValue)
                .valueByCategory(valueByCategory)
                .build();
    }

    private long computeMaxCategoryDepth(List<com.smartwms.entity.Category> all) {
        if (all.isEmpty()) return 0;
        java.util.Map<Long, Integer> depthMap = new java.util.HashMap<>();
        long maxDepth = 0;
        for (var cat : all) {
            int depth = 0;
            var current = cat;
            while (current.getParent() != null) {
                depth++;
                if (depthMap.containsKey(current.getParent().getId())) {
                    depth += depthMap.get(current.getParent().getId());
                    break;
                }
                current = current.getParent();
            }
            depthMap.put(cat.getId(), depth);
            maxDepth = Math.max(maxDepth, depth);
        }
        return maxDepth;
    }

    // ─── Recent Purchase Orders ──────────────────────────────

    @Override
    public List<DashboardPurchaseOrderResponse> getRecentOrders(int limit) {
        log.debug("Fetching {} recent purchase orders for dashboard", limit);
        List<com.smartwms.entity.PurchaseOrder> orders = purchaseOrderRepository.findRecentOrders(
                org.springframework.data.domain.PageRequest.of(0, limit));
        return orders.stream()
                .map(po -> DashboardPurchaseOrderResponse.builder()
                        .id(po.getId())
                        .orderNumber(po.getOrderNumber())
                        .supplierName(po.getSupplier() != null ? po.getSupplier().getName() : null)
                        .totalItems(po.getItems() != null ? po.getItems().size() : 0)
                        .totalAmount(po.getTotalAmount())
                        .status(po.getStatus())
                        .orderDate(po.getOrderDate())
                        .createdAt(po.getCreatedAt())
                        .build())
                .toList();
    }
}
