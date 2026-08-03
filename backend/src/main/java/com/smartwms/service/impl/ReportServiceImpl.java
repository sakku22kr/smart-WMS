package com.smartwms.service.impl;

import com.smartwms.constants.*;
import com.smartwms.dto.response.*;
import com.smartwms.entity.*;
import com.smartwms.repository.*;
import com.smartwms.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of {@link ReportService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final CategoryRepository categoryRepository;

    // ─── Inventory Report ──────────────────────────────────────

    @Override
    public InventoryReportResponse getInventoryReport() {
        log.info("Generating inventory report");

        long totalProducts = productRepository.count();
        long totalStock = productRepository.sumCurrentStock();
        BigDecimal totalValue = productRepository.sumInventoryValue();
        BigDecimal avgPrice = productRepository.avgSellingPrice();
        long lowStock = productRepository.findLowStockProducts().size();
        long outOfStock = productRepository.findOutOfStockProducts().size();
        long active = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactive = productRepository.countByStatus(ProductStatus.INACTIVE);

        // Category breakdown
        List<Object[]> categoryData = productRepository.countProductsByCategory();
        List<Object[]> categoryValues = productRepository.sumValueByCategory();
        Map<String, InventoryReportResponse.CategoryStockEntry> catMap = new LinkedHashMap<>();
        for (Object[] row : categoryData) {
            String catName = (String) row[0];
            Long count = (Long) row[1];
            catMap.put(catName, InventoryReportResponse.CategoryStockEntry.builder()
                    .categoryName(catName)
                    .productCount(count)
                    .totalStock(0L)
                    .totalValue(BigDecimal.ZERO)
                    .build());
        }
        for (Object[] row : categoryValues) {
            String catName = (String) row[0];
            BigDecimal value = (BigDecimal) row[1];
            if (catMap.containsKey(catName)) {
                catMap.get(catName).setTotalValue(value);
            }
        }
        List<InventoryReportResponse.CategoryStockEntry> categoryBreakdown = new ArrayList<>(catMap.values());

        // Warehouse breakdown
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<InventoryReportResponse.WarehouseStockEntry> warehouseBreakdown = new ArrayList<>();
        for (Warehouse w : warehouses) {
            long prodCount = productRepository.countByWarehouseId(w.getId());
            Double utilPct = w.getCapacity() > 0 ? (w.getCurrentUtilization() / w.getCapacity() * 100.0) : 0.0;
            warehouseBreakdown.add(InventoryReportResponse.WarehouseStockEntry.builder()
                    .warehouseName(w.getName())
                    .warehouseCode(w.getCode())
                    .productCount(prodCount)
                    .totalStock(0L)
                    .capacityUtilization(Math.round(utilPct * 10.0) / 10.0)
                    .build());
        }

        // Top products by value
        List<Product> topProducts = productRepository.findTopProductsByStock(PageRequest.of(0, 10));
        List<InventoryReportResponse.ProductStockEntry> topByValue = topProducts.stream()
                .filter(p -> p.getCurrentStock() > 0)
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .build())
                .toList();

        // Reorder alerts
        List<Product> reorderProducts = productRepository.findLowStockProducts();
        List<InventoryReportResponse.ProductStockEntry> reorderAlerts = reorderProducts.stream()
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .build())
                .toList();

        // Transaction summary
        List<Object[]> txnTypes = inventoryTransactionRepository.countByTransactionType();
        long stockIn = 0, stockOut = 0, adjustment = 0;
        for (Object[] row : txnTypes) {
            String type = row[0].toString();
            Long count = (Long) row[1];
            switch (type) {
                case "STOCK_IN" -> stockIn = count;
                case "STOCK_OUT" -> stockOut = count;
                case "ADJUSTMENT" -> adjustment = count;
                default -> {}
            }
        }

        YearMonth now = YearMonth.now();
        java.time.LocalDateTime start = now.atDay(1).atStartOfDay();
        java.time.LocalDateTime end = now.atEndOfMonth().atTime(23, 59, 59);
        BigDecimal totalInValue = inventoryTransactionRepository.sumStockInValueByDateRange(start, end);

        InventoryReportResponse.TransactionSummary txnSummary = InventoryReportResponse.TransactionSummary.builder()
                .totalTransactions(inventoryTransactionRepository.count())
                .stockInCount(stockIn)
                .stockOutCount(stockOut)
                .adjustmentCount(adjustment)
                .totalInValue(totalInValue)
                .totalOutValue(BigDecimal.ZERO)
                .build();

        return InventoryReportResponse.builder()
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStock)
                .totalInventoryValue(totalValue)
                .averageSellingPrice(avgPrice)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .activeProducts(active)
                .inactiveProducts(inactive)
                .categoryBreakdown(categoryBreakdown)
                .warehouseBreakdown(warehouseBreakdown)
                .topProductsByValue(topByValue)
                .reorderAlerts(reorderAlerts)
                .transactionSummary(txnSummary)
                .build();
    }

    // ─── Inventory Report (Filtered + Paginated) ───────────────

    @Override
    public InventoryReportResponse getInventoryReport(java.time.LocalDateTime dateFrom, java.time.LocalDateTime dateTo,
                                                       Long warehouseId, String sortBy, String sortDir,
                                                       int page, int size) {
        log.info("Generating filtered inventory report: warehouseId={}, sortBy={}, sortDir={}, page={}, size={}",
                warehouseId, sortBy, sortDir, page, size);

        // Build sort
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir)
                        ? org.springframework.data.domain.Sort.Direction.DESC
                        : org.springframework.data.domain.Sort.Direction.ASC,
                sortBy != null ? sortBy : "name"
        );

        // Stock Report (paginated)
        org.springframework.data.domain.Page<Product> stockPage = productRepository.findFiltered(warehouseId,
                org.springframework.data.domain.PageRequest.of(page, size, sort));

        List<InventoryReportResponse.ProductStockEntry> stockProducts = stockPage.getContent().stream()
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reservedStock(p.getReservedStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .purchasePrice(p.getPurchasePrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .status(p.getStatus().name())
                        .build())
                .toList();

        InventoryReportResponse.StockReport stockReport = InventoryReportResponse.StockReport.builder()
                .products(stockProducts)
                .totalProducts(stockPage.getTotalElements())
                .totalStockQuantity(productRepository.sumCurrentStock())
                .totalInventoryValue(productRepository.sumInventoryValue())
                .page(page)
                .size(size)
                .totalElements(stockPage.getTotalElements())
                .totalPages(stockPage.getTotalPages())
                .build();

        // Low Stock Report
        List<Product> lowStockProducts = productRepository.findLowStockFiltered(warehouseId);
        List<InventoryReportResponse.ProductStockEntry> lowStockEntries = lowStockProducts.stream()
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reservedStock(p.getReservedStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .purchasePrice(p.getPurchasePrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .status(p.getStatus().name())
                        .build())
                .toList();

        BigDecimal totalReorderValue = lowStockEntries.stream()
                .map(e -> e.getStockValue() != null ? e.getStockValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        InventoryReportResponse.LowStockReport lowStockReport = InventoryReportResponse.LowStockReport.builder()
                .products(lowStockEntries)
                .totalLowStock(lowStockEntries.size())
                .totalProducts(productRepository.count())
                .totalReorderValue(totalReorderValue)
                .build();

        // Out of Stock Report
        List<Product> outOfStockProducts = productRepository.findOutOfStockFiltered(warehouseId);
        List<InventoryReportResponse.ProductStockEntry> outOfStockEntries = outOfStockProducts.stream()
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reservedStock(p.getReservedStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .purchasePrice(p.getPurchasePrice())
                        .stockValue(BigDecimal.ZERO)
                        .status(p.getStatus().name())
                        .build())
                .toList();

        InventoryReportResponse.OutOfStockReport outOfStockReport = InventoryReportResponse.OutOfStockReport.builder()
                .products(outOfStockEntries)
                .totalOutOfStock(outOfStockEntries.size())
                .totalProducts(productRepository.count())
                .totalLostValue(BigDecimal.ZERO)
                .build();

        // Inventory Value Report
        BigDecimal totalPurchaseValue = productRepository.sumPurchaseValueByWarehouse(warehouseId);
        BigDecimal totalSellingValue = productRepository.sumSellingValueByWarehouse(warehouseId);
        BigDecimal potentialProfit = totalSellingValue.subtract(totalPurchaseValue);

        List<Object[]> catValueData = productRepository.sumValueByCategoryFiltered(warehouseId);
        List<InventoryReportResponse.CategoryValueEntry> categoryValues = catValueData.stream()
                .map(row -> InventoryReportResponse.CategoryValueEntry.builder()
                        .categoryName((String) row[0])
                        .productCount((Long) row[1])
                        .totalStock((Long) row[2])
                        .purchaseValue((BigDecimal) row[3])
                        .sellingValue((BigDecimal) row[4])
                        .build())
                .toList();

        List<Object[]> whValueData = productRepository.sumValueByWarehouseFiltered(warehouseId);
        List<InventoryReportResponse.WarehouseValueEntry> warehouseValues = whValueData.stream()
                .map(row -> InventoryReportResponse.WarehouseValueEntry.builder()
                        .warehouseName((String) row[0])
                        .warehouseCode((String) row[1])
                        .productCount((Long) row[2])
                        .totalStock((Long) row[3])
                        .purchaseValue((BigDecimal) row[4])
                        .sellingValue((BigDecimal) row[5])
                        .build())
                .toList();

        InventoryReportResponse.InventoryValueReport valueReport = InventoryReportResponse.InventoryValueReport.builder()
                .totalValue(totalSellingValue)
                .totalPurchaseValue(totalPurchaseValue)
                .totalSellingValue(totalSellingValue)
                .potentialProfit(potentialProfit)
                .byCategory(categoryValues)
                .byWarehouse(warehouseValues)
                .build();

        // Filter info
        String warehouseName = null;
        if (warehouseId != null) {
            warehouseName = warehouseRepository.findById(warehouseId).map(Warehouse::getName).orElse(null);
        }

        InventoryReportResponse.FilterInfo filterInfo = InventoryReportResponse.FilterInfo.builder()
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .warehouseId(warehouseId)
                .warehouseName(warehouseName)
                .sortBy(sortBy != null ? sortBy : "name")
                .sortDir(sortDir != null ? sortDir : "asc")
                .page(page)
                .size(size)
                .totalElements(stockPage.getTotalElements())
                .totalPages(stockPage.getTotalPages())
                .build();

        // Summary metrics
        long totalProducts = productRepository.count();
        long totalStock = productRepository.sumCurrentStock();
        BigDecimal totalValue = productRepository.sumInventoryValue();
        BigDecimal avgPrice = productRepository.avgSellingPrice();
        long lowStock = lowStockProducts.size();
        long outOfStock = outOfStockProducts.size();
        long active = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactive = productRepository.countByStatus(ProductStatus.INACTIVE);

        // Category breakdown (summary)
        List<Object[]> categoryData = productRepository.countProductsByCategory();
        List<Object[]> categoryValData = productRepository.sumValueByCategory();
        Map<String, InventoryReportResponse.CategoryStockEntry> catMap = new LinkedHashMap<>();
        for (Object[] row : categoryData) {
            String catName = (String) row[0];
            Long count = (Long) row[1];
            catMap.put(catName, InventoryReportResponse.CategoryStockEntry.builder()
                    .categoryName(catName)
                    .productCount(count)
                    .totalStock(0L)
                    .totalValue(BigDecimal.ZERO)
                    .build());
        }
        for (Object[] row : categoryValData) {
            String catName = (String) row[0];
            BigDecimal value = (BigDecimal) row[1];
            if (catMap.containsKey(catName)) {
                catMap.get(catName).setTotalValue(value);
            }
        }

        // Warehouse breakdown (summary)
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<InventoryReportResponse.WarehouseStockEntry> warehouseBreakdown = new ArrayList<>();
        for (Warehouse w : warehouses) {
            long prodCount = productRepository.countByWarehouseId(w.getId());
            Double utilPct = w.getCapacity() > 0 ? (w.getCurrentUtilization() / w.getCapacity() * 100.0) : 0.0;
            warehouseBreakdown.add(InventoryReportResponse.WarehouseStockEntry.builder()
                    .warehouseName(w.getName())
                    .warehouseCode(w.getCode())
                    .productCount(prodCount)
                    .totalStock(0L)
                    .capacityUtilization(Math.round(utilPct * 10.0) / 10.0)
                    .build());
        }

        // Top products by value (summary)
        List<Product> topProducts = productRepository.findTopProductsByStockValueFiltered(warehouseId, PageRequest.of(0, 10));
        List<InventoryReportResponse.ProductStockEntry> topByValue = topProducts.stream()
                .filter(p -> p.getCurrentStock() > 0)
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .build())
                .toList();

        // Reorder alerts (summary)
        List<Product> reorderProducts = productRepository.findLowStockFiltered(warehouseId);
        List<InventoryReportResponse.ProductStockEntry> reorderAlerts = reorderProducts.stream()
                .map(p -> InventoryReportResponse.ProductStockEntry.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .sku(p.getSku())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                        .currentStock(p.getCurrentStock())
                        .reorderLevel(p.getReorderLevel())
                        .sellingPrice(p.getSellingPrice())
                        .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                        .build())
                .toList();

        // Transaction summary
        List<Object[]> txnTypes = inventoryTransactionRepository.countByTransactionType();
        long stockIn = 0, stockOut = 0, adjustment = 0;
        for (Object[] row : txnTypes) {
            String type = row[0].toString();
            Long count = (Long) row[1];
            switch (type) {
                case "STOCK_IN" -> stockIn = count;
                case "STOCK_OUT" -> stockOut = count;
                case "ADJUSTMENT" -> adjustment = count;
                default -> {}
            }
        }

        YearMonth now = YearMonth.now();
        java.time.LocalDateTime start = now.atDay(1).atStartOfDay();
        java.time.LocalDateTime end = now.atEndOfMonth().atTime(23, 59, 59);
        BigDecimal totalInValue = inventoryTransactionRepository.sumStockInValueByDateRange(start, end);

        InventoryReportResponse.TransactionSummary txnSummary = InventoryReportResponse.TransactionSummary.builder()
                .totalTransactions(inventoryTransactionRepository.count())
                .stockInCount(stockIn)
                .stockOutCount(stockOut)
                .adjustmentCount(adjustment)
                .totalInValue(totalInValue)
                .totalOutValue(BigDecimal.ZERO)
                .build();

        return InventoryReportResponse.builder()
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStock)
                .totalInventoryValue(totalValue)
                .averageSellingPrice(avgPrice)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .activeProducts(active)
                .inactiveProducts(inactive)
                .categoryBreakdown(new ArrayList<>(catMap.values()))
                .warehouseBreakdown(warehouseBreakdown)
                .topProductsByValue(topByValue)
                .reorderAlerts(reorderAlerts)
                .transactionSummary(txnSummary)
                .filters(filterInfo)
                .stockReport(stockReport)
                .lowStockReport(lowStockReport)
                .outOfStockReport(outOfStockReport)
                .inventoryValueReport(valueReport)
                .build();
    }

    // ─── Product Report ────────────────────────────────────────

    @Override
    public ProductReportResponse getProductReport() {
        log.info("Generating product report");

        long total = productRepository.count();
        long active = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactive = productRepository.countByStatus(ProductStatus.INACTIVE);
        long discontinued = productRepository.countByStatus(ProductStatus.DISCONTINUED);
        BigDecimal totalValue = productRepository.sumInventoryValue();
        BigDecimal avgPrice = productRepository.avgSellingPrice();
        long noSupplier = productRepository.countWithoutSupplier();

        // Category breakdown
        List<Object[]> catData = productRepository.countProductsByCategory();
        List<Object[]> catValues = productRepository.sumValueByCategory();
        Map<String, ProductReportResponse.CategoryProductEntry> catMap = new LinkedHashMap<>();
        for (Object[] row : catData) {
            catMap.put((String) row[0], ProductReportResponse.CategoryProductEntry.builder()
                    .categoryName((String) row[0])
                    .productCount((Long) row[1])
                    .totalValue(BigDecimal.ZERO)
                    .build());
        }
        for (Object[] row : catValues) {
            if (catMap.containsKey((String) row[0])) {
                catMap.get((String) row[0]).setTotalValue((BigDecimal) row[1]);
            }
        }

        // Supplier breakdown
        List<Supplier> allSuppliers = supplierRepository.findByStatus(SupplierStatus.ACTIVE);
        List<ProductReportResponse.SupplierProductEntry> supplierBreakdown = new ArrayList<>();
        for (Supplier s : allSuppliers) {
            long count = productRepository.countBySupplierAndDeletedFalse(s);
            if (count > 0) {
                supplierBreakdown.add(ProductReportResponse.SupplierProductEntry.builder()
                        .supplierId(s.getId())
                        .supplierName(s.getName())
                        .supplierCode(s.getCode())
                        .productCount(count)
                        .totalValue(BigDecimal.ZERO)
                        .build());
            }
        }

        // Status breakdown
        List<ProductReportResponse.StatusCount> statusBreakdown = List.of(
                ProductReportResponse.StatusCount.builder().status("ACTIVE").count(active).build(),
                ProductReportResponse.StatusCount.builder().status("INACTIVE").count(inactive).build(),
                ProductReportResponse.StatusCount.builder().status("DISCONTINUED").count(discontinued).build()
        );

        // Top products by price
        List<Product> allProducts = productRepository.findAll();
        List<ProductReportResponse.ProductEntry> topByPrice = allProducts.stream()
                .sorted((a, b) -> b.getSellingPrice().compareTo(a.getSellingPrice()))
                .limit(10)
                .map(this::toProductEntry)
                .toList();

        // Recent products
        List<ProductReportResponse.ProductEntry> recent = allProducts.stream()
                .filter(p -> p.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(this::toProductEntry)
                .toList();

        return ProductReportResponse.builder()
                .totalProducts(total)
                .activeProducts(active)
                .inactiveProducts(inactive)
                .discontinuedProducts(discontinued)
                .totalCatalogValue(totalValue)
                .averagePrice(avgPrice)
                .productsWithoutSupplier(noSupplier)
                .productsWithoutWarehouse(0L)
                .categoryBreakdown(new ArrayList<>(catMap.values()))
                .supplierBreakdown(supplierBreakdown)
                .statusBreakdown(statusBreakdown)
                .topProductsByPrice(topByPrice)
                .recentProducts(recent)
                .build();
    }

    // ─── Product Report (Filtered + Paginated) ──────────────────

    @Override
    public ProductReportResponse getProductReport(String search, Long categoryId, Long supplierId,
                                                   String status, Long warehouseId,
                                                   String sortBy, String sortDir, int page, int size) {
        log.info("Generating filtered product report: search={}, category={}, supplier={}, status={}, warehouse={}",
                search, categoryId, supplierId, status, warehouseId);

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir)
                        ? org.springframework.data.domain.Sort.Direction.DESC
                        : org.springframework.data.domain.Sort.Direction.ASC,
                sortBy != null ? sortBy : "name"
        );

        // Paginated products
        Page<Product> productPage = productRepository.findForProductReport(
                search, categoryId, supplierId, status, warehouseId,
                org.springframework.data.domain.PageRequest.of(page, size, sort));

        List<ProductReportResponse.ProductEntry> productEntries = productPage.getContent().stream()
                .map(this::toProductEntryFull)
                .toList();

        // Statistics
        BigDecimal totalStockValue = productPage.getTotalElements() > 0
                ? productRepository.sumStockValueFiltered(search, categoryId, supplierId, status, warehouseId)
                : BigDecimal.ZERO;
        Long totalStockQty = productPage.getTotalElements() > 0
                ? productRepository.sumStockQuantityFiltered(search, categoryId, supplierId, status, warehouseId)
                : 0L;
        long lowStock = productRepository.countLowStockFiltered(search, categoryId, supplierId, warehouseId);
        long outOfStock = productRepository.countOutOfStockFiltered(search, categoryId, supplierId, warehouseId);

        ProductReportResponse.ProductStatistics stats = ProductReportResponse.ProductStatistics.builder()
                .totalProducts(productPage.getTotalElements())
                .activeProducts(productRepository.countByStatus(ProductStatus.ACTIVE))
                .inactiveProducts(productRepository.countByStatus(ProductStatus.INACTIVE))
                .discontinuedProducts(productRepository.countByStatus(ProductStatus.DISCONTINUED))
                .totalCatalogValue(totalStockValue)
                .totalStockValue(totalStockValue)
                .averagePrice(productPage.getTotalElements() > 0
                        ? totalStockValue.divide(BigDecimal.valueOf(productPage.getTotalElements()), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .averageStock(totalStockQty > 0 && productPage.getTotalElements() > 0
                        ? BigDecimal.valueOf(totalStockQty).divide(BigDecimal.valueOf(productPage.getTotalElements()), 1, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .totalStockQuantity(totalStockQty)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .productsWithSupplier(productPage.getTotalElements() - productRepository.countWithoutSupplier())
                .productsWithoutSupplier(productRepository.countWithoutSupplier())
                .productsWithWarehouse(0L)
                .productsWithoutWarehouse(0L)
                .categoryCount(productRepository.countProductsByCategory().size())
                .supplierCount(supplierRepository.countSuppliersWithProducts())
                .build();

        // Category breakdown (filtered)
        List<Object[]> catData = productRepository.countByCategoryFiltered(search, categoryId, supplierId, status, warehouseId);
        List<ProductReportResponse.CategoryProductEntry> categoryBreakdown = catData.stream()
                .map(row -> ProductReportResponse.CategoryProductEntry.builder()
                        .categoryName((String) row[0])
                        .productCount((Long) row[1])
                        .totalStock((Long) row[2])
                        .totalValue((BigDecimal) row[3])
                        .build())
                .toList();

        // Supplier breakdown (filtered)
        List<Object[]> supData = productRepository.countBySupplierFiltered(search, categoryId, supplierId, status, warehouseId);
        List<ProductReportResponse.SupplierProductEntry> supplierBreakdown = supData.stream()
                .map(row -> ProductReportResponse.SupplierProductEntry.builder()
                        .supplierId((Long) row[0])
                        .supplierName((String) row[1])
                        .supplierCode((String) row[2])
                        .productCount((Long) row[3])
                        .totalValue((BigDecimal) row[4])
                        .totalStock((Long) row[5])
                        .build())
                .toList();

        // Status breakdown (filtered)
        List<Object[]> statusData = productRepository.countByStatusFiltered(search, categoryId, supplierId, warehouseId);
        List<ProductReportResponse.StatusCount> statusBreakdown = statusData.stream()
                .map(row -> ProductReportResponse.StatusCount.builder()
                        .status((String) row[0])
                        .count((Long) row[1])
                        .totalValue((BigDecimal) row[2])
                        .build())
                .toList();

        // Top products by value (filtered)
        List<Product> topProducts = productRepository.findTopProductsFiltered(search, categoryId, supplierId, status, warehouseId, PageRequest.of(0, 10));
        List<ProductReportResponse.ProductEntry> topByValue = topProducts.stream()
                .map(this::toProductEntryFull)
                .toList();

        // Recent products (filtered)
        List<Product> recentProducts = productRepository.findRecentProductsFiltered(search, categoryId, supplierId, status, warehouseId, PageRequest.of(0, 10));
        List<ProductReportResponse.ProductEntry> recent = recentProducts.stream()
                .map(this::toProductEntryFull)
                .toList();

        // Filter info
        String catName = null;
        if (categoryId != null) {
            catName = categoryRepository.findById(categoryId).map(Category::getName).orElse(null);
        }
        String supName = null;
        if (supplierId != null) {
            supName = supplierRepository.findById(supplierId).map(Supplier::getName).orElse(null);
        }

        ProductReportResponse.FilterInfo filterInfo = ProductReportResponse.FilterInfo.builder()
                .search(search)
                .categoryId(categoryId)
                .categoryName(catName)
                .supplierId(supplierId)
                .supplierName(supName)
                .status(status)
                .warehouseId(warehouseId)
                .sortBy(sortBy != null ? sortBy : "name")
                .sortDir(sortDir != null ? sortDir : "asc")
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();

        ProductReportResponse.ProductList productList = ProductReportResponse.ProductList.builder()
                .items(productEntries)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .page(page)
                .size(size)
                .build();

        return ProductReportResponse.builder()
                .totalProducts(productPage.getTotalElements())
                .activeProducts(stats.getActiveProducts())
                .inactiveProducts(stats.getInactiveProducts())
                .discontinuedProducts(stats.getDiscontinuedProducts())
                .totalCatalogValue(stats.getTotalCatalogValue())
                .averagePrice(stats.getAveragePrice())
                .productsWithoutSupplier(stats.getProductsWithoutSupplier())
                .productsWithoutWarehouse(0L)
                .categoryBreakdown(categoryBreakdown)
                .supplierBreakdown(supplierBreakdown)
                .statusBreakdown(statusBreakdown)
                .topProductsByPrice(topByValue)
                .recentProducts(recent)
                .filters(filterInfo)
                .statistics(stats)
                .products(productList)
                .build();
    }

    // ─── Warehouse Report ──────────────────────────────────────

    @Override
    public WarehouseReportResponse getWarehouseReport() {
        log.info("Generating warehouse report");

        long total = warehouseRepository.count();
        long active = warehouseRepository.countByStatus(WarehouseStatus.ACTIVE);
        long inactive = warehouseRepository.countByStatus(WarehouseStatus.INACTIVE);
        long maintenance = warehouseRepository.countByStatus(WarehouseStatus.UNDER_MAINTENANCE);
        Double totalCapacity = warehouseRepository.sumCapacity();
        Double totalUtil = warehouseRepository.sumCurrentUtilization();
        Double utilPct = totalCapacity > 0 ? (totalUtil / totalCapacity * 100.0) : 0.0;
        long nearCap = warehouseRepository.countNearCapacity();
        long fullCap = warehouseRepository.countFull();

        // Warehouse details with values
        List<Warehouse> allWarehouses = warehouseRepository.findAll();
        List<WarehouseReportResponse.WarehouseEntry> warehouseEntries = new ArrayList<>();
        List<WarehouseReportResponse.WarehouseProductCount> productCounts = new ArrayList<>();
        List<WarehouseReportResponse.UtilizationEntry> utilizationEntries = new ArrayList<>();
        List<WarehouseReportResponse.WarehouseValueEntry> valueEntries = new ArrayList<>();
        long totalProducts = 0;
        long totalStockQty = 0;
        java.math.BigDecimal totalInvValue = java.math.BigDecimal.ZERO;

        for (Warehouse w : allWarehouses) {
            long prodCount = productRepository.countByWarehouseId(w.getId());
            Double wUtilPct = w.getCapacity() > 0 ? (w.getCurrentUtilization() / w.getCapacity() * 100.0) : 0.0;

            // Get inventory value for this warehouse
            java.math.BigDecimal whValue = productRepository.sumSellingValueByWarehouse(w.getId());
            Long whStock = productRepository.sumStockQuantityFiltered(null, null, null, null, w.getId());

            totalProducts += prodCount;
            totalStockQty += (whStock != null ? whStock : 0);
            totalInvValue = totalInvValue.add(whValue != null ? whValue : java.math.BigDecimal.ZERO);

            // Active POs for this warehouse
            List<PurchaseOrder> poList = purchaseOrderRepository.findByWarehouse(w);
            long activePOs = poList.stream().filter(po -> po.getStatus() == PurchaseOrderStatus.PENDING
                    || po.getStatus() == PurchaseOrderStatus.APPROVED
                    || po.getStatus() == PurchaseOrderStatus.ORDERED).count();

            warehouseEntries.add(WarehouseReportResponse.WarehouseEntry.builder()
                    .id(w.getId())
                    .name(w.getName())
                    .code(w.getCode())
                    .location(w.getLocation())
                    .manager(w.getManager())
                    .capacity(w.getCapacity())
                    .currentUtilization(w.getCurrentUtilization())
                    .utilizationPercent(Math.round(wUtilPct * 10.0) / 10.0)
                    .status(w.getStatus().name())
                    .productCount(prodCount)
                    .totalStock(whStock != null ? whStock : 0)
                    .inventoryValue(whValue != null ? whValue : java.math.BigDecimal.ZERO)
                    .activeOrders(activePOs)
                    .build());

            productCounts.add(WarehouseReportResponse.WarehouseProductCount.builder()
                    .warehouseName(w.getName())
                    .warehouseCode(w.getCode())
                    .productCount(prodCount)
                    .totalStock(whStock != null ? whStock : 0)
                    .build());

            utilizationEntries.add(WarehouseReportResponse.UtilizationEntry.builder()
                    .id(w.getId())
                    .name(w.getName())
                    .code(w.getCode())
                    .capacity(w.getCapacity())
                    .currentUtilization(w.getCurrentUtilization())
                    .utilizationPercent(Math.round(wUtilPct * 10.0) / 10.0)
                    .productCount(prodCount)
                    .status(w.getStatus().name())
                    .build());

            valueEntries.add(WarehouseReportResponse.WarehouseValueEntry.builder()
                    .id(w.getId())
                    .name(w.getName())
                    .code(w.getCode())
                    .productCount(prodCount)
                    .totalStock(whStock != null ? whStock : 0)
                    .inventoryValue(whValue != null ? whValue : java.math.BigDecimal.ZERO)
                    .purchaseValue(productRepository.sumPurchaseValueByWarehouse(w.getId()))
                    .build());
        }

        // Orders per warehouse
        List<WarehouseReportResponse.WarehousePOCount> ordersPerWarehouse = new ArrayList<>();
        for (Warehouse w : allWarehouses) {
            List<PurchaseOrder> poList = purchaseOrderRepository.findByWarehouse(w);
            long activePOs = poList.stream().filter(po -> po.getStatus() == PurchaseOrderStatus.PENDING
                    || po.getStatus() == PurchaseOrderStatus.APPROVED
                    || po.getStatus() == PurchaseOrderStatus.ORDERED).count();
            java.math.BigDecimal whPOValue = poList.stream()
                    .filter(po -> po.getStatus() != PurchaseOrderStatus.CANCELLED && po.getStatus() != PurchaseOrderStatus.REJECTED)
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            ordersPerWarehouse.add(WarehouseReportResponse.WarehousePOCount.builder()
                    .warehouseName(w.getName())
                    .orderCount(poList.size())
                    .activeOrders(activePOs)
                    .totalValue(whPOValue)
                    .build());
        }

        // Status breakdown
        List<WarehouseReportResponse.StatusCount> statusBreakdown = List.of(
                WarehouseReportResponse.StatusCount.builder().status("ACTIVE").count(active).totalCapacity(totalCapacity).totalUtilization(totalUtil).build(),
                WarehouseReportResponse.StatusCount.builder().status("INACTIVE").count(inactive).totalCapacity(0.0).totalUtilization(0.0).build(),
                WarehouseReportResponse.StatusCount.builder().status("UNDER_MAINTENANCE").count(maintenance).totalCapacity(0.0).totalUtilization(0.0).build()
        );

        // Statistics
        WarehouseReportResponse.WarehouseStatistics stats = WarehouseReportResponse.WarehouseStatistics.builder()
                .totalWarehouses(total)
                .activeWarehouses(active)
                .inactiveWarehouses(inactive)
                .maintenanceWarehouses(maintenance)
                .totalCapacity(totalCapacity)
                .totalUtilization(totalUtil)
                .utilizationPercentage(Math.round(utilPct * 10.0) / 10.0)
                .nearCapacityCount(nearCap)
                .fullCapacityCount(fullCap)
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStockQty)
                .totalInventoryValue(totalInvValue)
                .totalPurchaseOrders(purchaseOrderRepository.count())
                .build();

        return WarehouseReportResponse.builder()
                .totalWarehouses(total)
                .activeWarehouses(active)
                .inactiveWarehouses(inactive)
                .maintenanceWarehouses(maintenance)
                .totalCapacity(totalCapacity)
                .totalUtilization(totalUtil)
                .utilizationPercentage(Math.round(utilPct * 10.0) / 10.0)
                .nearCapacityCount(nearCap)
                .fullCapacityCount(fullCap)
                .warehouses(warehouseEntries)
                .productsPerWarehouse(productCounts)
                .ordersPerWarehouse(ordersPerWarehouse)
                .statistics(stats)
                .utilizationBreakdown(utilizationEntries)
                .valueBreakdown(valueEntries)
                .statusBreakdown(statusBreakdown)
                .build();
    }

    // ─── Supplier Report ───────────────────────────────────────

    @Override
    public SupplierReportResponse getSupplierReport() {
        log.info("Generating supplier report");

        long total = supplierRepository.count();
        long active = supplierRepository.countByStatus(SupplierStatus.ACTIVE);
        long inactive = supplierRepository.countByStatus(SupplierStatus.INACTIVE);
        long blacklisted = supplierRepository.countByStatus(SupplierStatus.BLACKLISTED);
        Double avgRating = supplierRepository.findAverageRating();
        long withProducts = supplierRepository.countSuppliersWithProducts();
        long withoutProducts = supplierRepository.countSuppliersWithoutProducts();
        BigDecimal totalPOValue = purchaseOrderRepository.sumTotalOrderValue();
        BigDecimal avgOrderValue = total > 0 ? totalPOValue.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // Top suppliers by value
        List<Supplier> allSuppliers = supplierRepository.findByStatus(SupplierStatus.ACTIVE);
        List<SupplierReportResponse.SupplierValueEntry> topByValue = new ArrayList<>();
        for (Supplier s : allSuppliers) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(s);
            BigDecimal value = orders.stream()
                    .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (value.compareTo(BigDecimal.ZERO) > 0) {
                topByValue.add(SupplierReportResponse.SupplierValueEntry.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .code(s.getCode())
                        .companyName(s.getCompanyName())
                        .orderCount(orders.size())
                        .totalOrderValue(value)
                        .rating(s.getRating())
                        .build());
            }
        }
        topByValue.sort((a, b) -> b.getTotalOrderValue().compareTo(a.getTotalOrderValue()));
        if (topByValue.size() > 10) topByValue = topByValue.subList(0, 10);

        // Top by rating
        List<SupplierReportResponse.SupplierRatingEntry> topByRating = allSuppliers.stream()
                .filter(s -> s.getRating() != null)
                .sorted((a, b) -> b.getRating().compareTo(a.getRating()))
                .limit(10)
                .map(s -> SupplierReportResponse.SupplierRatingEntry.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .code(s.getCode())
                        .rating(s.getRating())
                        .productCount(productRepository.countBySupplierAndDeletedFalse(s))
                        .build())
                .toList();

        // Status breakdown
        List<SupplierReportResponse.StatusCount> statusBreakdown = List.of(
                SupplierReportResponse.StatusCount.builder().status("ACTIVE").count(active).build(),
                SupplierReportResponse.StatusCount.builder().status("INACTIVE").count(inactive).build(),
                SupplierReportResponse.StatusCount.builder().status("BLACKLISTED").count(blacklisted).build()
        );

        // Region breakdown
        Map<String, Long> regionMap = new LinkedHashMap<>();
        List<Supplier> allSupp = supplierRepository.findAll();
        for (Supplier s : allSupp) {
            String region = s.getState() != null ? s.getState() : (s.getCity() != null ? s.getCity() : "Unknown");
            regionMap.merge(region, 1L, Long::sum);
        }
        List<SupplierReportResponse.RegionCount> regionBreakdown = regionMap.entrySet().stream()
                .map(e -> SupplierReportResponse.RegionCount.builder().region(e.getKey()).count(e.getValue()).build())
                .toList();

        return SupplierReportResponse.builder()
                .totalSuppliers(total)
                .activeSuppliers(active)
                .inactiveSuppliers(inactive)
                .blacklistedSuppliers(blacklisted)
                .averageRating(avgRating)
                .suppliersWithProducts(withProducts)
                .suppliersWithoutProducts(withoutProducts)
                .totalProcurementValue(totalPOValue)
                .averageOrderValue(avgOrderValue)
                .topSuppliersByValue(topByValue)
                .topSuppliersByRating(topByRating)
                .statusBreakdown(statusBreakdown)
                .regionBreakdown(regionBreakdown)
                .build();
    }

    // ─── Supplier Report (Filtered + Paginated) ─────────────────

    @Override
    public SupplierReportResponse getSupplierReport(String search, String status, String region,
                                                     String sortBy, String sortDir, int page, int size) {
        log.info("Generating filtered supplier report: search={}, status={}, region={}, sortBy={}, sortDir={}, page={}, size={}",
                search, status, region, sortBy, sortDir, page, size);

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir)
                        ? org.springframework.data.domain.Sort.Direction.DESC
                        : org.springframework.data.domain.Sort.Direction.ASC,
                sortBy != null ? sortBy : "name"
        );

        // Paginated suppliers
        Page<Supplier> supplierPage = supplierRepository.findForSupplierReport(
                search, status, region,
                org.springframework.data.domain.PageRequest.of(page, size, sort));

        // Build supplier entries with order/product counts
        List<SupplierReportResponse.SupplierEntry> supplierEntries = new ArrayList<>();
        for (Supplier s : supplierPage.getContent()) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(s);
            long activeOrders = orders.stream()
                    .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                    .count();
            BigDecimal orderValue = orders.stream()
                    .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long prodCount = productRepository.countBySupplierAndDeletedFalse(s);

            supplierEntries.add(SupplierReportResponse.SupplierEntry.builder()
                    .id(s.getId())
                    .name(s.getName())
                    .code(s.getCode())
                    .companyName(s.getCompanyName())
                    .contactPerson(s.getContactPerson())
                    .email(s.getEmail())
                    .phone(s.getPhone())
                    .city(s.getCity())
                    .state(s.getState())
                    .rating(s.getRating())
                    .status(s.getStatus().name())
                    .productCount(prodCount)
                    .orderCount(activeOrders)
                    .totalOrderValue(orderValue)
                    .build());
        }

        // Statistics
        long totalFiltered = supplierPage.getTotalElements();
        Double avgRating = supplierRepository.findAverageRatingFiltered(search, status, region);
        long withProducts = supplierRepository.countSuppliersWithProducts();
        long withoutProducts = supplierRepository.countSuppliersWithoutProducts();

        BigDecimal totalPOValue = purchaseOrderRepository.sumTotalOrderValue();
        BigDecimal avgOrderValue = totalFiltered > 0
                ? totalPOValue.divide(BigDecimal.valueOf(totalFiltered), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        SupplierReportResponse.SupplierStatistics stats = SupplierReportResponse.SupplierStatistics.builder()
                .totalSuppliers(totalFiltered)
                .activeSuppliers(supplierRepository.countByStatus(SupplierStatus.ACTIVE))
                .inactiveSuppliers(supplierRepository.countByStatus(SupplierStatus.INACTIVE))
                .blacklistedSuppliers(supplierRepository.countByStatus(SupplierStatus.BLACKLISTED))
                .averageRating(avgRating)
                .suppliersWithProducts(withProducts)
                .suppliersWithoutProducts(withoutProducts)
                .totalProcurementValue(totalPOValue)
                .averageOrderValue(avgOrderValue)
                .totalOrders(purchaseOrderRepository.count())
                .regionCount(supplierRepository.countByRegionFiltered(search, status, region).size())
                .build();

        // Top suppliers by value (filtered)
        List<Supplier> allFiltered = supplierRepository.findForSupplierReport(search, status, region, PageRequest.of(0, 50)).getContent();
        List<SupplierReportResponse.SupplierValueEntry> topByValue = new ArrayList<>();
        for (Supplier s : allFiltered) {
            List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplier(s);
            BigDecimal value = orders.stream()
                    .filter(o -> o.getStatus() != PurchaseOrderStatus.CANCELLED && o.getStatus() != PurchaseOrderStatus.REJECTED)
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long prodCount = productRepository.countBySupplierAndDeletedFalse(s);
            if (value.compareTo(BigDecimal.ZERO) > 0) {
                topByValue.add(SupplierReportResponse.SupplierValueEntry.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .code(s.getCode())
                        .companyName(s.getCompanyName())
                        .orderCount(orders.size())
                        .totalOrderValue(value)
                        .rating(s.getRating())
                        .productCount(prodCount)
                        .build());
            }
        }
        topByValue.sort((a, b) -> b.getTotalOrderValue().compareTo(a.getTotalOrderValue()));
        if (topByValue.size() > 10) topByValue = topByValue.subList(0, 10);

        // Top by rating (filtered)
        List<Supplier> topRated = supplierRepository.findTopSuppliersByRatingFiltered(search, status, region, PageRequest.of(0, 10));
        List<SupplierReportResponse.SupplierRatingEntry> topByRating = topRated.stream()
                .filter(s -> s.getRating() != null)
                .map(s -> SupplierReportResponse.SupplierRatingEntry.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .code(s.getCode())
                        .rating(s.getRating())
                        .productCount(productRepository.countBySupplierAndDeletedFalse(s))
                        .orderCount(purchaseOrderRepository.findBySupplier(s).size())
                        .build())
                .toList();

        // Status breakdown (summary, not filtered)
        long totalAll = supplierRepository.count();
        long activeAll = supplierRepository.countByStatus(SupplierStatus.ACTIVE);
        long inactiveAll = supplierRepository.countByStatus(SupplierStatus.INACTIVE);
        long blacklistedAll = supplierRepository.countByStatus(SupplierStatus.BLACKLISTED);
        List<SupplierReportResponse.StatusCount> statusBreakdown = List.of(
                SupplierReportResponse.StatusCount.builder().status("ACTIVE").count(activeAll).totalValue(BigDecimal.ZERO).build(),
                SupplierReportResponse.StatusCount.builder().status("INACTIVE").count(inactiveAll).totalValue(BigDecimal.ZERO).build(),
                SupplierReportResponse.StatusCount.builder().status("BLACKLISTED").count(blacklistedAll).totalValue(BigDecimal.ZERO).build()
        );

        // Region breakdown (filtered)
        List<Object[]> regionData = supplierRepository.countByRegionFiltered(search, status, region);
        List<SupplierReportResponse.RegionCount> regionBreakdown = regionData.stream()
                .map(row -> SupplierReportResponse.RegionCount.builder()
                        .region((String) row[0])
                        .count((Long) row[1])
                        .totalValue(BigDecimal.ZERO)
                        .build())
                .toList();

        SupplierReportResponse.FilterInfo filterInfo = SupplierReportResponse.FilterInfo.builder()
                .search(search)
                .status(status)
                .region(region)
                .sortBy(sortBy != null ? sortBy : "name")
                .sortDir(sortDir != null ? sortDir : "asc")
                .page(page)
                .size(size)
                .totalElements(totalFiltered)
                .totalPages(supplierPage.getTotalPages())
                .build();

        SupplierReportResponse.SupplierList supplierList = SupplierReportResponse.SupplierList.builder()
                .items(supplierEntries)
                .totalElements(totalFiltered)
                .totalPages(supplierPage.getTotalPages())
                .page(page)
                .size(size)
                .build();

        return SupplierReportResponse.builder()
                .totalSuppliers(totalFiltered)
                .activeSuppliers(stats.getActiveSuppliers())
                .inactiveSuppliers(stats.getInactiveSuppliers())
                .blacklistedSuppliers(stats.getBlacklistedSuppliers())
                .averageRating(avgRating)
                .suppliersWithProducts(withProducts)
                .suppliersWithoutProducts(withoutProducts)
                .totalProcurementValue(totalPOValue)
                .averageOrderValue(avgOrderValue)
                .topSuppliersByValue(topByValue)
                .topSuppliersByRating(topByRating)
                .statusBreakdown(statusBreakdown)
                .regionBreakdown(regionBreakdown)
                .filters(filterInfo)
                .statistics(stats)
                .suppliers(supplierList)
                .build();
    }

    // ─── Purchase Report ───────────────────────────────────────

    @Override
    public PurchaseReportResponse getPurchaseReport() {
        log.info("Generating purchase report");

        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        long totalOrders = allOrders.size();
        BigDecimal totalValue = allOrders.stream()
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgValue = totalOrders > 0 ? totalValue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        long draft = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.DRAFT).count();
        long pending = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING).count();
        long approved = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.APPROVED).count();
        long completed = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).count();
        long cancelled = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.CANCELLED).count();
        long rejected = allOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.REJECTED).count();
        long active = totalOrders - completed - cancelled - rejected;

        // Status breakdown
        Map<String, PurchaseReportResponse.StatusValueEntry> statusMap = new LinkedHashMap<>();
        for (PurchaseOrder po : allOrders) {
            String status = po.getStatus().name();
            statusMap.computeIfAbsent(status, k -> PurchaseReportResponse.StatusValueEntry.builder()
                    .status(k).count(0).totalValue(BigDecimal.ZERO).build());
            PurchaseReportResponse.StatusValueEntry entry = statusMap.get(status);
            entry.setCount(entry.getCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
        }

        // Monthly trend (last 12 months)
        YearMonth now = YearMonth.now();
        List<PurchaseReportResponse.MonthlyOrderEntry> monthlyTrend = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            List<PurchaseOrder> monthOrders = allOrders.stream()
                    .filter(o -> o.getOrderDate() != null
                            && o.getOrderDate().getMonth() == month.getMonth()
                            && o.getOrderDate().getYear() == month.getYear())
                    .toList();
            BigDecimal monthValue = monthOrders.stream()
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            monthlyTrend.add(PurchaseReportResponse.MonthlyOrderEntry.builder()
                    .month(key)
                    .orderCount(monthOrders.size())
                    .totalValue(monthValue)
                    .build());
        }

        // Top suppliers
        Map<Long, PurchaseReportResponse.SupplierOrderEntry> suppMap = new LinkedHashMap<>();
        for (PurchaseOrder po : allOrders) {
            Long suppId = po.getSupplier().getId();
            suppMap.computeIfAbsent(suppId, k -> PurchaseReportResponse.SupplierOrderEntry.builder()
                    .supplierId(k)
                    .supplierName(po.getSupplier().getName())
                    .supplierCode(po.getSupplier().getCode())
                    .orderCount(0)
                    .totalValue(BigDecimal.ZERO)
                    .build());
            PurchaseReportResponse.SupplierOrderEntry entry = suppMap.get(suppId);
            entry.setOrderCount(entry.getOrderCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
        }
        List<PurchaseReportResponse.SupplierOrderEntry> topSuppliers = suppMap.values().stream()
                .sorted((a, b) -> b.getTotalValue().compareTo(a.getTotalValue()))
                .limit(10)
                .toList();

        // Warehouse breakdown
        Map<Long, PurchaseReportResponse.WarehouseOrderEntry> whMap = new LinkedHashMap<>();
        for (PurchaseOrder po : allOrders) {
            Long whId = po.getWarehouse().getId();
            whMap.computeIfAbsent(whId, k -> PurchaseReportResponse.WarehouseOrderEntry.builder()
                    .warehouseId(k)
                    .warehouseName(po.getWarehouse().getName())
                    .orderCount(0)
                    .totalValue(BigDecimal.ZERO)
                    .build());
            PurchaseReportResponse.WarehouseOrderEntry entry = whMap.get(whId);
            entry.setOrderCount(entry.getOrderCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
        }

        // Recent orders
        List<PurchaseReportResponse.OrderSummaryEntry> recentOrders = allOrders.stream()
                .sorted((a, b) -> b.getCreatedAt() != null && a.getCreatedAt() != null
                        ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .limit(10)
                .map(po -> PurchaseReportResponse.OrderSummaryEntry.builder()
                        .id(po.getId())
                        .orderNumber(po.getOrderNumber())
                        .supplierName(po.getSupplier().getName())
                        .warehouseName(po.getWarehouse().getName())
                        .orderDate(po.getOrderDate())
                        .totalAmount(po.getTotalAmount())
                        .status(po.getStatus().name())
                        .build())
                .toList();

        return PurchaseReportResponse.builder()
                .totalOrders(totalOrders)
                .totalValue(totalValue)
                .averageOrderValue(avgValue)
                .draftCount(draft)
                .pendingCount(pending)
                .approvedCount(approved)
                .completedCount(completed)
                .cancelledCount(cancelled)
                .rejectedCount(rejected)
                .activeCount(active)
                .statusBreakdown(new ArrayList<>(statusMap.values()))
                .monthlyTrend(monthlyTrend)
                .topSuppliers(topSuppliers)
                .warehouseBreakdown(new ArrayList<>(whMap.values()))
                .recentOrders(recentOrders)
                .dateFrom(now.minusMonths(11).atDay(1))
                .dateTo(now.atEndOfMonth())
                .build();
    }

    // ─── Purchase Report (Filtered + Paginated) ────────────────

    @Override
    public PurchaseReportResponse getPurchaseReport(String search, Long supplierId, Long warehouseId,
                                                     String status, LocalDate dateFrom, LocalDate dateTo,
                                                     String sortBy, String sortDir, int page, int size) {
        log.info("Generating filtered purchase report: search={}, supplier={}, warehouse={}, status={}, dateFrom={}, dateTo={}",
                search, supplierId, warehouseId, status, dateFrom, dateTo);

        // Build filtered orders list
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        List<PurchaseOrder> filteredOrders = allOrders.stream()
                .filter(o -> search == null || search.isEmpty()
                        || o.getOrderNumber().toLowerCase().contains(search.toLowerCase())
                        || o.getSupplier().getName().toLowerCase().contains(search.toLowerCase()))
                .filter(o -> supplierId == null || o.getSupplier().getId().equals(supplierId))
                .filter(o -> warehouseId == null || o.getWarehouse().getId().equals(warehouseId))
                .filter(o -> status == null || status.isEmpty() || o.getStatus().name().equals(status))
                .filter(o -> dateFrom == null || (o.getOrderDate() != null && !o.getOrderDate().isBefore(dateFrom)))
                .filter(o -> dateTo == null || (o.getOrderDate() != null && !o.getOrderDate().isAfter(dateTo)))
                .toList();

        // Sort
        java.util.Comparator<PurchaseOrder> comparator;
        switch (sortBy != null ? sortBy : "orderDate") {
            case "totalAmount" -> comparator = (a, b) -> a.getTotalAmount().compareTo(b.getTotalAmount());
            case "orderNumber" -> comparator = (a, b) -> a.getOrderNumber().compareTo(b.getOrderNumber());
            case "supplier" -> comparator = (a, b) -> a.getSupplier().getName().compareTo(b.getSupplier().getName());
            default -> comparator = (a, b) -> {
                if (a.getOrderDate() == null) return 1;
                if (b.getOrderDate() == null) return -1;
                return a.getOrderDate().compareTo(b.getOrderDate());
            };
        }
        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        filteredOrders = filteredOrders.stream().sorted(comparator).toList();

        // Paginate
        long totalElements = filteredOrders.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = (int) Math.min((long) page * size, totalElements);
        int toIndex = (int) Math.min((long) fromIndex + size, totalElements);
        List<PurchaseOrder> pageOrders = filteredOrders.subList(fromIndex, toIndex);

        // Build order entries
        List<PurchaseReportResponse.OrderSummaryEntry> orderEntries = pageOrders.stream()
                .map(po -> PurchaseReportResponse.OrderSummaryEntry.builder()
                        .id(po.getId())
                        .orderNumber(po.getOrderNumber())
                        .supplierName(po.getSupplier().getName())
                        .supplierCode(po.getSupplier().getCode())
                        .warehouseName(po.getWarehouse().getName())
                        .orderDate(po.getOrderDate())
                        .expectedDelivery(po.getExpectedDeliveryDate())
                        .totalAmount(po.getTotalAmount())
                        .status(po.getStatus().name())
                        .itemCount(po.getItems() != null ? po.getItems().size() : 0)
                        .build())
                .toList();

        // Statistics from filtered set
        long totalOrders = filteredOrders.size();
        BigDecimal totalValue = filteredOrders.stream().map(PurchaseOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgValue = totalOrders > 0 ? totalValue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        long draft = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.DRAFT).count();
        long pending = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING).count();
        long approved = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.APPROVED).count();
        long completed = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).count();
        long cancelled = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.CANCELLED).count();
        long rejected = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.REJECTED).count();
        long active = totalOrders - completed - cancelled - rejected;

        BigDecimal completedValue = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).map(PurchaseOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pendingValue = filteredOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING || o.getStatus() == PurchaseOrderStatus.APPROVED || o.getStatus() == PurchaseOrderStatus.ORDERED).map(PurchaseOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Unique suppliers/warehouses
        long uniqueSuppliers = filteredOrders.stream().map(o -> o.getSupplier().getId()).distinct().count();
        long uniqueWarehouses = filteredOrders.stream().map(o -> o.getWarehouse().getId()).distinct().count();

        PurchaseReportResponse.PurchaseStatistics stats = PurchaseReportResponse.PurchaseStatistics.builder()
                .totalOrders(totalOrders)
                .totalValue(totalValue)
                .averageOrderValue(avgValue)
                .activeCount(active)
                .completedCount(completed)
                .cancelledCount(cancelled)
                .pendingCount(pending)
                .approvedCount(approved)
                .draftCount(draft)
                .rejectedCount(rejected)
                .completedValue(completedValue)
                .pendingValue(pendingValue)
                .uniqueSuppliers(uniqueSuppliers)
                .uniqueWarehouses(uniqueWarehouses)
                .build();

        // Status breakdown (from filtered)
        Map<String, PurchaseReportResponse.StatusValueEntry> statusMap = new LinkedHashMap<>();
        for (PurchaseOrder po : filteredOrders) {
            String st = po.getStatus().name();
            statusMap.computeIfAbsent(st, k -> PurchaseReportResponse.StatusValueEntry.builder()
                    .status(k).count(0).totalValue(BigDecimal.ZERO).build());
            PurchaseReportResponse.StatusValueEntry entry = statusMap.get(st);
            entry.setCount(entry.getCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
        }

        // Monthly trend (last 12 months, from all orders for trend accuracy)
        YearMonth now = YearMonth.now();
        List<PurchaseReportResponse.MonthlyOrderEntry> monthlyTrend = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            List<PurchaseOrder> monthOrders = allOrders.stream()
                    .filter(o -> o.getOrderDate() != null
                            && o.getOrderDate().getMonth() == month.getMonth()
                            && o.getOrderDate().getYear() == month.getYear())
                    .toList();
            BigDecimal monthValue = monthOrders.stream().map(PurchaseOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            long monthCompleted = monthOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.COMPLETED).count();
            long monthPending = monthOrders.stream().filter(o -> o.getStatus() == PurchaseOrderStatus.PENDING || o.getStatus() == PurchaseOrderStatus.APPROVED).count();
            monthlyTrend.add(PurchaseReportResponse.MonthlyOrderEntry.builder()
                    .month(key)
                    .orderCount(monthOrders.size())
                    .totalValue(monthValue)
                    .completedCount(monthCompleted)
                    .pendingCount(monthPending)
                    .build());
        }

        // Top suppliers (from filtered)
        Map<Long, PurchaseReportResponse.SupplierOrderEntry> suppMap = new LinkedHashMap<>();
        for (PurchaseOrder po : filteredOrders) {
            Long suppId = po.getSupplier().getId();
            suppMap.computeIfAbsent(suppId, k -> PurchaseReportResponse.SupplierOrderEntry.builder()
                    .supplierId(k)
                    .supplierName(po.getSupplier().getName())
                    .supplierCode(po.getSupplier().getCode())
                    .orderCount(0)
                    .totalValue(BigDecimal.ZERO)
                    .completedCount(0L)
                    .build());
            PurchaseReportResponse.SupplierOrderEntry entry = suppMap.get(suppId);
            entry.setOrderCount(entry.getOrderCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
            if (po.getStatus() == PurchaseOrderStatus.COMPLETED) {
                entry.setCompletedCount(entry.getCompletedCount() + 1);
            }
        }
        List<PurchaseReportResponse.SupplierOrderEntry> topSuppliers = suppMap.values().stream()
                .sorted((a, b) -> b.getTotalValue().compareTo(a.getTotalValue()))
                .limit(10).toList();

        // Warehouse breakdown (from filtered)
        Map<Long, PurchaseReportResponse.WarehouseOrderEntry> whMap = new LinkedHashMap<>();
        for (PurchaseOrder po : filteredOrders) {
            Long whId = po.getWarehouse().getId();
            whMap.computeIfAbsent(whId, k -> PurchaseReportResponse.WarehouseOrderEntry.builder()
                    .warehouseId(k)
                    .warehouseName(po.getWarehouse().getName())
                    .orderCount(0)
                    .totalValue(BigDecimal.ZERO)
                    .activeOrders(0L)
                    .build());
            PurchaseReportResponse.WarehouseOrderEntry entry = whMap.get(whId);
            entry.setOrderCount(entry.getOrderCount() + 1);
            entry.setTotalValue(entry.getTotalValue().add(po.getTotalAmount()));
            if (po.getStatus() == PurchaseOrderStatus.PENDING || po.getStatus() == PurchaseOrderStatus.APPROVED || po.getStatus() == PurchaseOrderStatus.ORDERED) {
                entry.setActiveOrders(entry.getActiveOrders() + 1);
            }
        }

        // Recent orders (from filtered)
        List<PurchaseReportResponse.OrderSummaryEntry> recentOrders = filteredOrders.stream()
                .sorted((a, b) -> b.getCreatedAt() != null && a.getCreatedAt() != null
                        ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .limit(10)
                .map(po -> PurchaseReportResponse.OrderSummaryEntry.builder()
                        .id(po.getId())
                        .orderNumber(po.getOrderNumber())
                        .supplierName(po.getSupplier().getName())
                        .supplierCode(po.getSupplier().getCode())
                        .warehouseName(po.getWarehouse().getName())
                        .orderDate(po.getOrderDate())
                        .expectedDelivery(po.getExpectedDeliveryDate())
                        .totalAmount(po.getTotalAmount())
                        .status(po.getStatus().name())
                        .itemCount(po.getItems() != null ? po.getItems().size() : 0)
                        .build())
                .toList();

        // Filter info
        String supName = null;
        if (supplierId != null) {
            supName = supplierRepository.findById(supplierId).map(Supplier::getName).orElse(null);
        }
        String whName = null;
        if (warehouseId != null) {
            whName = warehouseRepository.findById(warehouseId).map(Warehouse::getName).orElse(null);
        }

        PurchaseReportResponse.FilterInfo filterInfo = PurchaseReportResponse.FilterInfo.builder()
                .search(search)
                .supplierId(supplierId)
                .supplierName(supName)
                .warehouseId(warehouseId)
                .warehouseName(whName)
                .status(status)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .sortBy(sortBy != null ? sortBy : "orderDate")
                .sortDir(sortDir != null ? sortDir : "desc")
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();

        PurchaseReportResponse.OrderList orderList = PurchaseReportResponse.OrderList.builder()
                .items(orderEntries)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .page(page)
                .size(size)
                .build();

        return PurchaseReportResponse.builder()
                .totalOrders(totalOrders)
                .totalValue(totalValue)
                .averageOrderValue(avgValue)
                .draftCount(draft)
                .pendingCount(pending)
                .approvedCount(approved)
                .completedCount(completed)
                .cancelledCount(cancelled)
                .rejectedCount(rejected)
                .activeCount(active)
                .statusBreakdown(new ArrayList<>(statusMap.values()))
                .monthlyTrend(monthlyTrend)
                .topSuppliers(topSuppliers)
                .warehouseBreakdown(new ArrayList<>(whMap.values()))
                .recentOrders(recentOrders)
                .dateFrom(dateFrom != null ? dateFrom : now.minusMonths(11).atDay(1))
                .dateTo(dateTo != null ? dateTo : now.atEndOfMonth())
                .statistics(stats)
                .filters(filterInfo)
                .orders(orderList)
                .build();
    }

    // ─── Private Helpers ───────────────────────────────────────

    private ProductReportResponse.ProductEntry toProductEntry(Product p) {
        return ProductReportResponse.ProductEntry.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .sellingPrice(p.getSellingPrice())
                .currentStock(p.getCurrentStock())
                .status(p.getStatus().name())
                .build();
    }

    private ProductReportResponse.ProductEntry toProductEntryFull(Product p) {
        return ProductReportResponse.ProductEntry.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
                .sellingPrice(p.getSellingPrice())
                .purchasePrice(p.getPurchasePrice())
                .currentStock(p.getCurrentStock())
                .reorderLevel(p.getReorderLevel())
                .stockValue(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                .status(p.getStatus().name())
                .build();
    }
}
