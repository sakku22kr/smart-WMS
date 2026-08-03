package com.smartwms.repository;

import com.smartwms.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for {@link PurchaseOrderItem} entities.
 */
@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);

    List<PurchaseOrderItem> findByProductId(Long productId);

    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.product.id = :productId AND poi.purchaseOrder.status IN ('ORDERED', 'PARTIALLY_RECEIVED')")
    List<PurchaseOrderItem> findOpenOrderItemsByProduct(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(poi.orderedQuantity - poi.receivedQuantity), 0) FROM PurchaseOrderItem poi WHERE poi.product.id = :productId AND poi.purchaseOrder.status IN ('ORDERED', 'PARTIALLY_RECEIVED')")
    int sumOpenQuantityByProduct(@Param("productId") Long productId);
}
