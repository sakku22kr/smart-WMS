package com.smartwms.mapper;

import com.smartwms.constants.StockStatus;
import com.smartwms.dto.request.ProductRequest;
import com.smartwms.dto.response.ProductResponse;
import com.smartwms.entity.Product;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProductMapper {

    @Mapping(target = "categoryId", expression = "java(getCategoryId(product))")
    @Mapping(target = "categoryName", expression = "java(getCategoryName(product))")
    @Mapping(target = "supplierId", expression = "java(getSupplierId(product))")
    @Mapping(target = "supplierName", expression = "java(getSupplierName(product))")
    @Mapping(target = "supplierEmail", expression = "java(getSupplierEmail(product))")
    @Mapping(target = "supplierPhone", expression = "java(getSupplierPhone(product))")
    @Mapping(target = "warehouseId", expression = "java(getWarehouseId(product))")
    @Mapping(target = "warehouseName", expression = "java(getWarehouseName(product))")
    @Mapping(target = "warehouseLocation", expression = "java(getWarehouseLocation(product))")
    @Mapping(target = "availableStock", expression = "java(product.getAvailableStock())")
    @Mapping(target = "stockStatus", expression = "java(calculateStockStatus(product))")
    @Mapping(target = "lowStock", expression = "java(product.isLowStock())")
    @Mapping(target = "outOfStock", expression = "java(product.isOutOfStock())")
    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "currentStock", ignore = true)
    @Mapping(target = "reservedStock", ignore = true)
    Product toEntity(ProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "currentStock", ignore = true)
    @Mapping(target = "reservedStock", ignore = true)
    void updateEntityFromRequest(ProductRequest request, @MappingTarget Product product);

    default Long getCategoryId(Product product) {
        if (product == null || product.getCategory() == null) return null;
        return product.getCategory().getId();
    }

    default String getCategoryName(Product product) {
        if (product == null || product.getCategory() == null) return null;
        return product.getCategory().getName();
    }

    default Long getSupplierId(Product product) {
        if (product == null || product.getSupplier() == null) return null;
        return product.getSupplier().getId();
    }

    default String getSupplierName(Product product) {
        if (product == null || product.getSupplier() == null) return null;
        return product.getSupplier().getName();
    }

    default String getSupplierEmail(Product product) {
        if (product == null || product.getSupplier() == null) return null;
        return product.getSupplier().getEmail();
    }

    default String getSupplierPhone(Product product) {
        if (product == null || product.getSupplier() == null) return null;
        return product.getSupplier().getPhone();
    }

    default Long getWarehouseId(Product product) {
        if (product == null || product.getWarehouse() == null) return null;
        return product.getWarehouse().getId();
    }

    default String getWarehouseName(Product product) {
        if (product == null || product.getWarehouse() == null) return null;
        return product.getWarehouse().getName();
    }

    default String getWarehouseLocation(Product product) {
        if (product == null || product.getWarehouse() == null) return null;
        return product.getWarehouse().getLocation();
    }

    default StockStatus calculateStockStatus(Product product) {
        if (product == null) return null;
        int currentStock = product.getCurrentStock();
        int reorderLevel = product.getReorderLevel();
        if (currentStock <= 0) return StockStatus.OUT_OF_STOCK;
        if (currentStock <= reorderLevel) return StockStatus.LOW_STOCK;
        if (reorderLevel > 0 && currentStock > reorderLevel * 3) return StockStatus.OVERSTOCKED;
        return StockStatus.IN_STOCK;
    }
}
