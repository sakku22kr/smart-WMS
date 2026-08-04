package com.smartwms.repository;

import com.smartwms.entity.Supplier;
import com.smartwms.constants.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Supplier} entities.
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>,
                                            JpaSpecificationExecutor<Supplier> {

    Optional<Supplier> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Supplier> findByStatus(SupplierStatus status);

    long countByStatus(SupplierStatus status);

    @Query(value = "SELECT * FROM suppliers WHERE id = :id", nativeQuery = true)
    Optional<Supplier> findByIdNative(@Param("id") Long id);

    @Query(value = "SELECT * FROM suppliers WHERE deleted = true", nativeQuery = true)
    Page<Supplier> findDeleted(Pageable pageable);

    @Query(value = "SELECT * FROM suppliers WHERE deleted = true AND (LOWER(name) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(code) LIKE LOWER(CONCAT('%',:keyword,'%')))", nativeQuery = true)
    Page<Supplier> findDeletedWithSearch(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COALESCE(AVG(s.rating), 0.0) FROM Supplier s WHERE s.rating IS NOT NULL AND s.deleted = false")
    Double findAverageRating();

    @Query(value = "SELECT COUNT(DISTINCT s.id) FROM suppliers s INNER JOIN products p ON p.supplier_id = s.id WHERE s.deleted = false AND p.deleted = false", nativeQuery = true)
    long countSuppliersWithProducts();

    @Query(value = "SELECT COUNT(*) FROM suppliers s WHERE s.deleted = false AND s.id NOT IN (SELECT DISTINCT p.supplier_id FROM products p WHERE p.deleted = false AND p.supplier_id IS NOT NULL)", nativeQuery = true)
    long countSuppliersWithoutProducts();

    // ─── Filtered Queries for Supplier Reports ───────────────

    @Query("SELECT s FROM Supplier s WHERE s.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR CAST(s.status AS string) = :status) " +
           "AND (:region IS NULL OR :region = '' OR s.state = :region)")
    Page<Supplier> findForSupplierReport(
        @Param("search") String search,
        @Param("status") String status,
        @Param("region") String region,
        Pageable pageable);

    @Query("SELECT COALESCE(AVG(s.rating), 0.0) FROM Supplier s WHERE s.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR CAST(s.status AS string) = :status) " +
           "AND (:region IS NULL OR :region = '' OR s.state = :region)")
    Double findAverageRatingFiltered(
        @Param("search") String search,
        @Param("status") String status,
        @Param("region") String region);

    @Query("SELECT s.state, COUNT(s) FROM Supplier s WHERE s.deleted = false AND s.state IS NOT NULL " +
           "AND (:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR CAST(s.status AS string) = :status) " +
           "AND (:region IS NULL OR :region = '' OR s.state = :region) " +
           "GROUP BY s.state ORDER BY COUNT(s) DESC")
    List<Object[]> countByRegionFiltered(
        @Param("search") String search,
        @Param("status") String status,
        @Param("region") String region);

    // Note: NULLS LAST removed — replaced with CASE for H2/MySQL portability
    @Query("SELECT s FROM Supplier s WHERE s.deleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR CAST(s.status AS string) = :status) " +
           "AND (:region IS NULL OR :region = '' OR s.state = :region) " +
           "ORDER BY CASE WHEN s.rating IS NULL THEN 1 ELSE 0 END ASC, s.rating DESC")
    List<Supplier> findTopSuppliersByRatingFiltered(
        @Param("search") String search,
        @Param("status") String status,
        @Param("region") String region,
        Pageable pageable);
}
