package com.smartwms.mapper;

import com.smartwms.dto.request.PurchaseOrderRequest;
import com.smartwms.dto.response.PurchaseOrderResponse;
import com.smartwms.entity.PurchaseOrder;
import com.smartwms.entity.PurchaseOrderItem;
import com.smartwms.entity.PurchaseOrderStatusHistory;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for PurchaseOrder ↔ DTO conversions.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {}
)
public interface PurchaseOrderMapper {

    @Mapping(target = "supplierId",    expression = "java(getSupplierId(po))")
    @Mapping(target = "supplierName",  expression = "java(getSupplierName(po))")
    @Mapping(target = "supplierCode",  expression = "java(getSupplierCode(po))")
    @Mapping(target = "warehouseId",   expression = "java(getWarehouseId(po))")
    @Mapping(target = "warehouseName", expression = "java(getWarehouseName(po))")
    @Mapping(target = "totalItems",    expression = "java(po.getItems().size())")
    @Mapping(target = "totalQuantity", expression = "java(po.getTotalItemCount())")
    @Mapping(target = "totalReceivedQuantity", expression = "java(po.getReceivedItemCount())")
    @Mapping(target = "statusHistory", expression = "java(toStatusHistoryResponseList(po.getStatusHistory()))")
    @Mapping(target = "rejectedBy",      expression = "java(po.getRejectedBy())")
    @Mapping(target = "rejectedAt",      expression = "java(po.getRejectedAt())")
    @Mapping(target = "cancelledBy",     expression = "java(po.getCancelledBy())")
    @Mapping(target = "cancelledAt",     expression = "java(po.getCancelledAt())")
    @Mapping(target = "inventoryAdjusted", expression = "java(po.getInventoryAdjusted() != null ? po.getInventoryAdjusted() : false)")
    PurchaseOrderResponse toResponse(PurchaseOrder po);

    List<PurchaseOrderResponse> toResponseList(List<PurchaseOrder> purchaseOrders);

    @Mapping(target = "id",               ignore = true)
    @Mapping(target = "version",          ignore = true)
    @Mapping(target = "createdAt",        ignore = true)
    @Mapping(target = "updatedAt",        ignore = true)
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "updatedBy",        ignore = true)
    @Mapping(target = "deleted",          ignore = true)
    @Mapping(target = "deletedAt",        ignore = true)
    @Mapping(target = "deletedBy",        ignore = true)
    @Mapping(target = "supplier",         ignore = true)
    @Mapping(target = "warehouse",        ignore = true)
    @Mapping(target = "items",            ignore = true)
    @Mapping(target = "subtotal",         ignore = true)
    @Mapping(target = "totalAmount",      ignore = true)
    @Mapping(target = "approvedBy",       ignore = true)
    @Mapping(target = "approvedAt",       ignore = true)
    @Mapping(target = "receivedBy",       ignore = true)
    @Mapping(target = "receivedAt",       ignore = true)
    PurchaseOrder toEntity(PurchaseOrderRequest request);

    @Mapping(target = "id",               ignore = true)
    @Mapping(target = "purchaseOrder",    ignore = true)
    @Mapping(target = "product",          ignore = true)
    PurchaseOrderItem toItemEntity(PurchaseOrderRequest.PurchaseOrderItemRequest request);

    @Mapping(target = "id",            expression = "java(item.getId())")
    @Mapping(target = "productId",     expression = "java(getProductId(item))")
    @Mapping(target = "pendingQuantity", expression = "java(item.getPendingQuantity())")
    PurchaseOrderResponse.PurchaseOrderItemResponse toItemResponse(PurchaseOrderItem item);

    List<PurchaseOrderResponse.PurchaseOrderItemResponse> toItemResponseList(List<PurchaseOrderItem> items);

    default Long getSupplierId(PurchaseOrder po) {
        return po.getSupplier() != null ? po.getSupplier().getId() : null;
    }

    default String getSupplierName(PurchaseOrder po) {
        return po.getSupplier() != null ? po.getSupplier().getName() : null;
    }

    default String getSupplierCode(PurchaseOrder po) {
        return po.getSupplier() != null ? po.getSupplier().getCode() : null;
    }

    default Long getWarehouseId(PurchaseOrder po) {
        return po.getWarehouse() != null ? po.getWarehouse().getId() : null;
    }

    default String getWarehouseName(PurchaseOrder po) {
        return po.getWarehouse() != null ? po.getWarehouse().getName() : null;
    }

    default Long getProductId(PurchaseOrderItem item) {
        return item.getProduct() != null ? item.getProduct().getId() : null;
    }

    default PurchaseOrderResponse.PurchaseOrderStatusHistoryResponse toStatusHistoryResponse(PurchaseOrderStatusHistory h) {
        if (h == null) return null;
        return PurchaseOrderResponse.PurchaseOrderStatusHistoryResponse.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .changedBy(h.getChangedBy())
                .changedAt(h.getChangedAt())
                .remarks(h.getRemarks())
                .build();
    }

    default List<PurchaseOrderResponse.PurchaseOrderStatusHistoryResponse> toStatusHistoryResponseList(
            List<PurchaseOrderStatusHistory> history) {
        if (history == null) return List.of();
        return history.stream().map(this::toStatusHistoryResponse).toList();
    }
}
