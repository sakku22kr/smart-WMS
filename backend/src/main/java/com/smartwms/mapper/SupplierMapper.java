package com.smartwms.mapper;

import com.smartwms.dto.request.SupplierRequest;
import com.smartwms.dto.response.SupplierResponse;
import com.smartwms.dto.response.SupplierSummaryResponse;
import com.smartwms.entity.Supplier;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for {@link Supplier} ↔ DTO conversions.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SupplierMapper {

    SupplierResponse        toResponse(Supplier supplier);
    SupplierSummaryResponse toSummaryResponse(Supplier supplier);
    List<SupplierResponse>  toResponseList(List<Supplier> suppliers);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "version",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted",   ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    Supplier toEntity(SupplierRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "version",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted",   ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    void updateEntityFromRequest(SupplierRequest request, @MappingTarget Supplier supplier);
}
