package com.smartwms.repository;

import com.smartwms.entity.SupplierDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link SupplierDocument} entities.
 */
@Repository
public interface SupplierDocumentRepository extends JpaRepository<SupplierDocument, Long> {

    List<SupplierDocument> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);

    Page<SupplierDocument> findBySupplierId(Long supplierId, Pageable pageable);

    List<SupplierDocument> findBySupplierIdAndDocumentType(Long supplierId, String documentType);

    Optional<SupplierDocument> findByIdAndSupplierId(Long id, Long supplierId);

    @Query("SELECT COUNT(d) FROM SupplierDocument d WHERE d.supplier.id = :supplierId AND d.deleted = false")
    long countBySupplierId(@Param("supplierId") Long supplierId);

    @Query(value = "SELECT * FROM supplier_documents WHERE supplier_id = :supplierId AND deleted = true", nativeQuery = true)
    List<SupplierDocument> findDeletedBySupplierId(@Param("supplierId") Long supplierId);
}
