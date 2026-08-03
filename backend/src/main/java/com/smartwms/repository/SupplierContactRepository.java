package com.smartwms.repository;

import com.smartwms.entity.SupplierContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link SupplierContact} entities.
 */
@Repository
public interface SupplierContactRepository extends JpaRepository<SupplierContact, Long> {

    List<SupplierContact> findBySupplierIdOrderByPrimaryDescNameAsc(Long supplierId);

    List<SupplierContact> findBySupplierId(Long supplierId);

    Optional<SupplierContact> findByIdAndSupplierId(Long id, Long supplierId);

    @Query("SELECT COUNT(c) FROM SupplierContact c WHERE c.supplier.id = :supplierId AND c.deleted = false")
    long countBySupplierId(@Param("supplierId") Long supplierId);

    boolean existsBySupplierIdAndPrimaryTrue(Long supplierId);
}
