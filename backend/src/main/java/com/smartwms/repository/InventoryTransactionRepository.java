package com.smartwms.repository;

import com.smartwms.constants.InventoryTransactionType;
import com.smartwms.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long>,
                                                       JpaSpecificationExecutor<InventoryTransaction> {

    Page<InventoryTransaction> findByProductIdOrderByTransactionDateDesc(Long productId, Pageable pageable);

    Page<InventoryTransaction> findByWarehouseIdOrderByTransactionDateDesc(Long warehouseId, Pageable pageable);

    Page<InventoryTransaction> findByProductIdAndWarehouseIdOrderByTransactionDateDesc(
            Long productId, Long warehouseId, Pageable pageable);

    Page<InventoryTransaction> findByTransactionTypeOrderByTransactionDateDesc(
            InventoryTransactionType type, Pageable pageable);

    Page<InventoryTransaction> findByReferenceNumberOrderByTransactionDateDesc(
            String referenceNumber, Pageable pageable);

    List<InventoryTransaction> findTop10ByProductIdOrderByTransactionDateDesc(Long productId);

    @Query("SELECT t FROM InventoryTransaction t WHERE t.product.id = :productId AND t.warehouse.id = :warehouseId ORDER BY t.transactionDate DESC")
    List<InventoryTransaction> findByProductAndWarehouse(@Param("productId") Long productId,
                                                          @Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(t) FROM InventoryTransaction t WHERE t.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(t) FROM InventoryTransaction t WHERE t.warehouse.id = :warehouseId")
    long countByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM InventoryTransaction t WHERE t.transactionType = 'STOCK_IN' AND t.product.id = :productId")
    long sumStockInByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM InventoryTransaction t WHERE t.transactionType = 'STOCK_OUT' AND t.product.id = :productId")
    long sumStockOutByProductId(@Param("productId") Long productId);

    @Query("SELECT t FROM InventoryTransaction t WHERE t.transactionDate BETWEEN :start AND :end ORDER BY t.transactionDate DESC")
    Page<InventoryTransaction> findByDateRange(@Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end,
                                                Pageable pageable);

    @Query("SELECT t.transactionType, COUNT(t) FROM InventoryTransaction t GROUP BY t.transactionType")
    List<Object[]> countByTransactionType();

    @Query("SELECT COALESCE(SUM(t.totalValue), 0) FROM InventoryTransaction t WHERE t.transactionType = 'STOCK_IN' AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumStockInValueByDateRange(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    boolean existsByReferenceNumber(String referenceNumber);
}
