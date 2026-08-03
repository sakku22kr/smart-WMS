package com.smartwms.mapper;

import com.smartwms.dto.request.RoleRequest;
import com.smartwms.dto.response.RoleResponse;
import com.smartwms.entity.Role;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for {@link Role} ↔ DTO conversions.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface RoleMapper {

    @Mapping(target = "name", expression = "java(role.getName() != null ? role.getName().name() : null)")
    RoleResponse toResponse(Role role);

    List<RoleResponse> toResponseList(List<Role> roles);

    Set<RoleResponse> toResponseSet(Set<Role> roles);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "version",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Role toEntity(RoleRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "version",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(RoleRequest request, @MappingTarget Role role);
}
