package com.smartwms.mapper;

import com.smartwms.dto.request.InventoryRequest;
import com.smartwms.dto.response.InventoryResponse;
import com.smartwms.entity.InventoryTransaction;
import com.smartwms.entity.Product;
import com.smartwms.entity.Warehouse;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "quantityBefore", ignore = true)
    @Mapping(target = "quantityAfter", ignore = true)
    @Mapping(target = "totalValue", ignore = true)
    @Mapping(target = "performedBy", ignore = true)
    @Mapping(target = "transactionDate", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    InventoryTransaction toEntity(InventoryRequest request);

    @Mapping(target = "productId", expression = "java(getProductId(transaction))")
    @Mapping(target = "productName", expression = "java(getProductName(transaction))")
    @Mapping(target = "productSku", expression = "java(getProductSku(transaction))")
    @Mapping(target = "warehouseId", expression = "java(getWarehouseId(transaction))")
    @Mapping(target = "warehouseName", expression = "java(getWarehouseName(transaction))")
    @Mapping(target = "destinationWarehouseName", expression = "java(getDestinationWarehouseName(transaction))")
    InventoryResponse toResponse(InventoryTransaction transaction);

    default Long getProductId(InventoryTransaction t) {
        if (t == null || t.getProduct() == null) return null;
        return t.getProduct().getId();
    }

    default String getProductName(InventoryTransaction t) {
        if (t == null || t.getProduct() == null) return null;
        return t.getProduct().getName();
    }

    default String getProductSku(InventoryTransaction t) {
        if (t == null || t.getProduct() == null) return null;
        return t.getProduct().getSku();
    }

    default Long getWarehouseId(InventoryTransaction t) {
        if (t == null || t.getWarehouse() == null) return null;
        return t.getWarehouse().getId();
    }

    default String getWarehouseName(InventoryTransaction t) {
        if (t == null || t.getWarehouse() == null) return null;
        return t.getWarehouse().getName();
    }

    default String getDestinationWarehouseName(InventoryTransaction t) {
        if (t == null || t.getDestinationWarehouseId() == null) return null;
        return "Warehouse #" + t.getDestinationWarehouseId();
    }
}
