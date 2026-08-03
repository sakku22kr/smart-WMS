package com.smartwms.service.impl;

import com.smartwms.dto.response.InventoryStatisticsResponse;
import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.entity.Product;
import com.smartwms.mapper.DashboardMapper;
import com.smartwms.repository.ProductRepository;
import com.smartwms.service.InventoryAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of {@link InventoryAlertService}.
 * Provides inventory alerts, stock monitoring, and health statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryAlertServiceImpl implements InventoryAlertService {

    private final ProductRepository productRepository;
    private final DashboardMapper dashboardMapper;

    @Override
    public List<LowStockProductResponse> getLowStockProducts() {
        log.debug("Fetching low-stock products");
        List<Product> products = productRepository.findLowStockProducts();
        return dashboardMapper.toLowStockList(products);
    }

    @Override
    public List<LowStockProductResponse> getOutOfStockProducts() {
        log.debug("Fetching out-of-stock products");
        List<Product> products = productRepository.findOutOfStockProducts();
        return dashboardMapper.toLowStockList(products);
    }

    @Override
    public List<LowStockProductResponse> getReorderAlerts() {
        log.debug("Fetching reorder alerts");
        List<Product> lowStock = productRepository.findLowStockProducts();
        List<Product> outOfStock = productRepository.findOutOfStockProducts();

        Set<Long> ids = new HashSet<>();
        List<Product> all = new ArrayList<>();

        for (Product p : outOfStock) {
            if (ids.add(p.getId())) all.add(p);
        }
        for (Product p : lowStock) {
            if (ids.add(p.getId())) all.add(p);
        }

        return dashboardMapper.toLowStockList(all);
    }

    @Override
    public InventoryStatisticsResponse getInventoryStatistics() {
        log.debug("Computing inventory statistics");

        List<Product> allProducts = productRepository.findAll();
        long totalProducts = allProducts.size();

        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        List<Product> outOfStockProducts = productRepository.findOutOfStockProducts();
        List<Product> overstockedProducts = allProducts.stream()
                .filter(p -> p.getReorderLevel() != null && p.getReorderLevel() > 0 &&
                        p.getCurrentStock() > p.getReorderLevel() * 2)
                .toList();

        List<Product> inStockProducts = allProducts.stream()
                .filter(p -> p.getCurrentStock() > 0 &&
                        (p.getReorderLevel() == null || p.getCurrentStock() > p.getReorderLevel()))
                .toList();

        long totalStockQuantity = allProducts.stream().mapToLong(Product::getCurrentStock).sum();
        BigDecimal totalInventoryValue = allProducts.stream()
                .map(p -> p.getSellingPrice() != null ?
                        p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())) :
                        BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageSellingPrice = productRepository.avgSellingPrice();

        long lowStockCount = lowStockProducts.size();
        long outOfStockCount = outOfStockProducts.size();
        long overstockedCount = overstockedProducts.size();
        long inStockCount = inStockProducts.size();

        BigDecimal lowStockValue = lowStockProducts.stream()
                .map(p -> p.getSellingPrice() != null ?
                        p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())) :
                        BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long productsRequiringReorder = lowStockCount + outOfStockCount;
        long totalReorderQuantity = lowStockProducts.stream()
                .mapToLong(p -> Math.max(0, (p.getReorderLevel() != null ? p.getReorderLevel() : 0) - p.getCurrentStock()))
                .sum();

        int stockHealthScore = calculateHealthScore(totalProducts, inStockCount, lowStockCount, outOfStockCount);

        List<InventoryStatisticsResponse.StockDistributionItem> stockDistribution = List.of(
                InventoryStatisticsResponse.StockDistributionItem.builder()
                        .label("In Stock")
                        .count(inStockCount)
                        .percentage(totalProducts > 0 ? round(inStockCount * 100.0 / totalProducts) : 0)
                        .color("#22c55e")
                        .build(),
                InventoryStatisticsResponse.StockDistributionItem.builder()
                        .label("Low Stock")
                        .count(lowStockCount)
                        .percentage(totalProducts > 0 ? round(lowStockCount * 100.0 / totalProducts) : 0)
                        .color("#f97316")
                        .build(),
                InventoryStatisticsResponse.StockDistributionItem.builder()
                        .label("Out of Stock")
                        .count(outOfStockCount)
                        .percentage(totalProducts > 0 ? round(outOfStockCount * 100.0 / totalProducts) : 0)
                        .color("#ef4444")
                        .build(),
                InventoryStatisticsResponse.StockDistributionItem.builder()
                        .label("Overstocked")
                        .count(overstockedCount)
                        .percentage(totalProducts > 0 ? round(overstockedCount * 100.0 / totalProducts) : 0)
                        .color("#3b82f6")
                        .build()
        );

        List<LowStockProductResponse> urgentReorder = lowStockProducts.stream()
                .sorted(Comparator.<Product>comparingInt(p ->
                        p.getReorderLevel() != null ? p.getReorderLevel() - p.getCurrentStock() : 0).reversed())
                .limit(5)
                .map(dashboardMapper::toLowStock)
                .toList();

        Map<String, List<Product>> byCategory = allProducts.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(p -> p.getCategory().getName()));

        List<InventoryStatisticsResponse.CategoryStockSummary> categorySummaries = byCategory.entrySet().stream()
                .map(entry -> {
                    List<Product> catProducts = entry.getValue();
                    long catTotal = catProducts.size();
                    long catInStock = catProducts.stream().filter(p -> p.getCurrentStock() > 0).count();
                    long catLow = catProducts.stream().filter(p -> p.getCurrentStock() > 0 && p.getReorderLevel() != null && p.getCurrentStock() <= p.getReorderLevel()).count();
                    long catOut = catProducts.stream().filter(p -> p.getCurrentStock() <= 0).count();
                    int catHealth = calculateHealthScore(catTotal, catInStock, catLow, catOut);

                    return InventoryStatisticsResponse.CategoryStockSummary.builder()
                            .categoryName(entry.getKey())
                            .totalProducts(catTotal)
                            .inStockProducts(catInStock)
                            .lowStockProducts(catLow)
                            .outOfStockProducts(catOut)
                            .categoryHealthScore(catHealth)
                            .build();
                })
                .sorted(Comparator.comparingLong(InventoryStatisticsResponse.CategoryStockSummary::getLowStockProducts).reversed())
                .toList();

        return InventoryStatisticsResponse.builder()
                .totalProducts(totalProducts)
                .inStockProducts(inStockCount)
                .lowStockProducts(lowStockCount)
                .outOfStockProducts(outOfStockCount)
                .overstockedProducts(overstockedCount)
                .totalStockQuantity(totalStockQuantity)
                .totalInventoryValue(totalInventoryValue)
                .averageSellingPrice(averageSellingPrice)
                .lowStockValue(lowStockValue)
                .productsRequiringReorder(productsRequiringReorder)
                .totalReorderQuantity(totalReorderQuantity)
                .stockHealthScore(stockHealthScore)
                .stockDistribution(stockDistribution)
                .urgentReorderProducts(urgentReorder)
                .categorySummaries(categorySummaries)
                .build();
    }

    @Override
    public Integer getStockHealthScore() {
        log.debug("Computing stock health score");
        List<Product> allProducts = productRepository.findAll();
        long total = allProducts.size();
        if (total == 0) return 100;

        long inStock = allProducts.stream().filter(p -> p.getCurrentStock() > 0).count();
        long lowStock = productRepository.findLowStockProducts().size();
        long outOfStock = productRepository.findOutOfStockProducts().size();

        return calculateHealthScore(total, inStock - lowStock, lowStock, outOfStock);
    }

    @Override
    public List<LowStockProductResponse> getOverstockedProducts() {
        log.debug("Fetching overstocked products");
        List<Product> allProducts = productRepository.findAll();
        List<Product> overstocked = allProducts.stream()
                .filter(p -> p.getReorderLevel() != null && p.getReorderLevel() > 0 &&
                        p.getCurrentStock() > p.getReorderLevel() * 2)
                .toList();
        return dashboardMapper.toLowStockList(overstocked);
    }

    @Override
    public List<LowStockProductResponse> getCriticalAlerts() {
        log.debug("Fetching critical alerts (stock below 50% of reorder level)");
        List<Product> allProducts = productRepository.findAll();
        List<Product> critical = allProducts.stream()
                .filter(p -> p.getReorderLevel() != null && p.getReorderLevel() > 0 &&
                        p.getCurrentStock() < p.getReorderLevel() * 0.5)
                .toList();
        return dashboardMapper.toLowStockList(critical);
    }

    private int calculateHealthScore(long total, long inStock, long lowStock, long outOfStock) {
        if (total == 0) return 100;

        double inStockPercent = (inStock * 100.0) / total;
        double lowStockPenalty = (lowStock * 10.0) / total;
        double outOfStockPenalty = (outOfStock * 20.0) / total;

        int score = (int) Math.round(inStockPercent - lowStockPenalty - outOfStockPenalty);
        return Math.max(0, Math.min(100, score));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
