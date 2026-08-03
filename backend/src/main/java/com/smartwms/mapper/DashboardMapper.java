package com.smartwms.mapper;

import com.smartwms.dto.response.LowStockProductResponse;
import com.smartwms.entity.Product;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for Dashboard-specific response projections.
 *
 * <p>Maps {@link Product} → {@link LowStockProductResponse} for the
 * low-stock and out-of-stock alert panels.</p>
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {CategoryMapper.class, WarehouseMapper.class}
)
public interface DashboardMapper {

    @Mapping(target = "availableStock", expression = "java(product.getAvailableStock())")
    @Mapping(target = "category",  source = "category")
    @Mapping(target = "warehouse", source = "warehouse")
    LowStockProductResponse toLowStock(Product product);

    List<LowStockProductResponse> toLowStockList(List<Product> products);
}
