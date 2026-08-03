package com.smartwms.repository;

import com.smartwms.entity.SupplierNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link SupplierNote} entities.
 */
@Repository
public interface SupplierNoteRepository extends JpaRepository<SupplierNote, Long> {

    List<SupplierNote> findBySupplierIdOrderByPinnedDescCreatedAtDesc(Long supplierId);

    Page<SupplierNote> findBySupplierId(Long supplierId, Pageable pageable);

    List<SupplierNote> findBySupplierIdAndNoteType(Long supplierId, SupplierNote.SupplierNoteType noteType);

    Optional<SupplierNote> findByIdAndSupplierId(Long id, Long supplierId);

    @Query("SELECT COUNT(n) FROM SupplierNote n WHERE n.supplier.id = :supplierId AND n.deleted = false")
    long countBySupplierId(@Param("supplierId") Long supplierId);

    long countBySupplierIdAndPinnedTrue(Long supplierId);
}
