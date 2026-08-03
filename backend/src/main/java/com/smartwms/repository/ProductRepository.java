package com.smartwms.repository;

import com.smartwms.entity.Category;
import com.smartwms.entity.Product;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.Warehouse;
import com.smartwms.constants.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Product} entities.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
                                           JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    boolean existsByBarcode(String barcode);

    boolean existsByBarcodeAndIdNot(String barcode, Long id);

    List<Product> findByCategory(Category category);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findBySupplier(Supplier supplier);

    Page<Product> findBySupplier(Supplier supplier, org.springframework.data.domain.Pageable pageable);

    List<Product> findByWarehouse(Warehouse warehouse);

    Page<Product> findByWarehouse(Warehouse warehouse, org.springframework.data.domain.Pageable pageable);

    List<Product> findByStatus(ProductStatus status);

    long countByStatus(ProductStatus status);

    long countByCategoryId(Long categoryId);

    long countBySupplierId(Long supplierId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.supplier = :supplier AND p.deleted = false")
    long countBySupplierAndDeletedFalse(Supplier supplier);

    long countByWarehouseId(Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.currentStock), 0) FROM Product p")
    long sumCurrentStock();

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel AND p.currentStock > 0")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.currentStock <= 0")
    List<Product> findOutOfStockProducts();

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(String keyword);

    @Query(value = "SELECT COUNT(*) FROM products p WHERE p.deleted = false AND p.supplier_id IS NULL", nativeQuery = true)
    long countWithoutSupplier();

    @Query(value = "SELECT * FROM products p WHERE p.deleted = true AND p.id = :id", nativeQuery = true)
    Optional<Product> findDeletedById(@org.springframework.data.repository.query.Param("id") Long id);

    @Query(value = "SELECT * FROM products p WHERE p.deleted = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')))", nativeQuery = true)
    List<Product> findDeletedByKeyword(@org.springframework.data.repository.query.Param("keyword") String keyword);

    @Query(value = "SELECT * FROM products p WHERE p.deleted = true", nativeQuery = true)
    List<Product> findAllDeleted();

    @Query("SELECT COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p")
    java.math.BigDecimal sumInventoryValue();

    @Query("SELECT COALESCE(AVG(p.sellingPrice), 0) FROM Product p")
    java.math.BigDecimal avgSellingPrice();

    @Query("SELECT p FROM Product p WHERE p.deleted = false ORDER BY p.currentStock DESC")
    List<Product> findTopProductsByStock(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p.category.name as categoryName, COUNT(p) as cnt FROM Product p WHERE p.deleted = false AND p.category IS NOT NULL GROUP BY p.category.name ORDER BY cnt DESC")
    List<Object[]> countProductsByCategory();

    @Query("SELECT p.category.name as categoryName, COALESCE(SUM(p.currentStock * p.sellingPrice), 0) as totalValue FROM Product p WHERE p.deleted = false AND p.category IS NOT NULL GROUP BY p.category.name ORDER BY totalValue DESC")
    List<Object[]> sumValueByCategory();

    // ─── Filtered Queries for Inventory Reports ──────────────

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) ORDER BY p.name ASC")
    Page<Product> findFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId,
                               org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) AND p.currentStock <= p.reorderLevel AND p.currentStock > 0")
    List<Product> findLowStockFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) AND p.currentStock <= 0")
    List<Product> findOutOfStockFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.currentStock * p.purchasePrice), 0) FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    java.math.BigDecimal sumPurchaseValueByWarehouse(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    java.math.BigDecimal sumSellingValueByWarehouse(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p.category.name as categoryName, COUNT(p) as cnt, COALESCE(SUM(p.currentStock), 0) as totalStock, COALESCE(SUM(p.currentStock * p.purchasePrice), 0) as purchaseValue, COALESCE(SUM(p.currentStock * p.sellingPrice), 0) as sellingValue FROM Product p WHERE p.deleted = false AND p.category IS NOT NULL AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) GROUP BY p.category.name ORDER BY sellingValue DESC")
    List<Object[]> sumValueByCategoryFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p.warehouse.name as whName, p.warehouse.code as whCode, COUNT(p) as cnt, COALESCE(SUM(p.currentStock), 0) as totalStock, COALESCE(SUM(p.currentStock * p.purchasePrice), 0) as purchaseValue, COALESCE(SUM(p.currentStock * p.sellingPrice), 0) as sellingValue FROM Product p WHERE p.deleted = false AND p.warehouse IS NOT NULL AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) GROUP BY p.warehouse.name, p.warehouse.code ORDER BY sellingValue DESC")
    List<Object[]> sumValueByWarehouseFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) AND p.currentStock > 0 ORDER BY (p.currentStock * p.sellingPrice) DESC")
    List<Product> findTopProductsByStockValueFiltered(@org.springframework.data.repository.query.Param("warehouseId") Long warehouseId,
                                                      org.springframework.data.domain.Pageable pageable);

    // ─── Filtered Queries for Product Reports ────────────────

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    Page<Product> findForProductReport(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId,
        org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    java.math.BigDecimal sumStockValueFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.currentStock), 0) FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    Long sumStockQuantityFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p.category.name, COUNT(p), COALESCE(SUM(p.currentStock), 0), COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p WHERE p.deleted = false AND p.category IS NOT NULL " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) " +
           "GROUP BY p.category.name ORDER BY SUM(p.currentStock * p.sellingPrice) DESC")
    List<Object[]> countByCategoryFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p.supplier.id, p.supplier.name, p.supplier.code, COUNT(p), COALESCE(SUM(p.currentStock * p.sellingPrice), 0), COALESCE(SUM(p.currentStock), 0) FROM Product p WHERE p.deleted = false AND p.supplier IS NOT NULL " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) " +
           "GROUP BY p.supplier.id, p.supplier.name, p.supplier.code ORDER BY SUM(p.currentStock * p.sellingPrice) DESC")
    List<Object[]> countBySupplierFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT CAST(p.status AS string), COUNT(p), COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) " +
           "GROUP BY p.status")
    List<Object[]> countByStatusFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deleted = false AND p.currentStock <= p.reorderLevel AND p.currentStock > 0 " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    long countLowStockFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deleted = false AND p.currentStock <= 0 " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)")
    long countOutOfStockFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId);

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) " +
           "AND p.currentStock > 0 ORDER BY (p.currentStock * p.sellingPrice) DESC")
    List<Product> findTopProductsFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId,
        org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:supplierId IS NULL OR p.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR :status = '' OR CAST(p.status AS string) = :status) " +
           "AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId) " +
           "ORDER BY p.createdAt DESC")
    List<Product> findRecentProductsFiltered(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
        @org.springframework.data.repository.query.Param("supplierId") Long supplierId,
        @org.springframework.data.repository.query.Param("status") String status,
        @org.springframework.data.repository.query.Param("warehouseId") Long warehouseId,
        org.springframework.data.domain.Pageable pageable);
}
