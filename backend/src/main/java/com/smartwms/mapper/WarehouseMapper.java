package com.smartwms.mapper;

import com.smartwms.dto.request.WarehouseRequest;
import com.smartwms.dto.response.WarehouseResponse;
import com.smartwms.entity.Warehouse;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface WarehouseMapper {

    @Mapping(target = "utilizationPercentage", expression = "java(computeUtilizationPercentage(warehouse))")
    WarehouseResponse toResponse(Warehouse warehouse);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    Warehouse toEntity(WarehouseRequest request);

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
    void updateEntityFromRequest(WarehouseRequest request, @MappingTarget Warehouse warehouse);

    default Double computeUtilizationPercentage(Warehouse warehouse) {
        if (warehouse == null || warehouse.getCapacity() == null || warehouse.getCapacity() == 0.0) {
            return 0.0;
        }
        double percentage = (warehouse.getCurrentUtilization() / warehouse.getCapacity()) * 100;
        return Math.round(percentage * 10.0) / 10.0;
    }
}
