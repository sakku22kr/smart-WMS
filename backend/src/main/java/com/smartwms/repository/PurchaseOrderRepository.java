package com.smartwms.repository;

import com.smartwms.constants.PurchaseOrderStatus;
import com.smartwms.entity.PurchaseOrder;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link PurchaseOrder} entities.
 */
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long>,
                                               JpaSpecificationExecutor<PurchaseOrder> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    List<PurchaseOrder> findBySupplier(Supplier supplier);

    List<PurchaseOrder> findByWarehouse(Warehouse warehouse);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    Page<PurchaseOrder> findBySupplierId(Long supplierId, Pageable pageable);

    long countByStatus(PurchaseOrderStatus status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status IN ('PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED')")
    long countActiveOrders();

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE po.status NOT IN ('CANCELLED', 'REJECTED')")
    java.math.BigDecimal sumTotalOrderValue();

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE po.status = 'PENDING'")
    java.math.BigDecimal sumPendingOrderValue();

    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId AND po.status NOT IN ('CANCELLED', 'REJECTED', 'COMPLETED')")
    List<PurchaseOrder> findActiveOrdersBySupplier(@Param("supplierId") Long supplierId);

    @Query("SELECT po FROM PurchaseOrder po ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findRecentOrders(Pageable pageable);

    @Query(value = "SELECT * FROM purchase_order WHERE id = :id", nativeQuery = true)
    Optional<PurchaseOrder> findByIdNative(@Param("id") Long id);
}
