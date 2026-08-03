package com.smartwms.mapper;

import com.smartwms.dto.request.UserRequest;
import com.smartwms.dto.response.UserResponse;
import com.smartwms.dto.response.UserSummaryResponse;
import com.smartwms.entity.User;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for {@link User} ↔ DTO conversions.
 *
 * <p>Roles mapping is delegated to {@link RoleMapper}. Password is never
 * included in responses. Role assignment from request is handled in the
 * service layer (requires repository lookup).</p>
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {RoleMapper.class}
)
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "roles",    source = "roles")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "roles",    source = "roles")
    UserSummaryResponse toSummaryResponse(User user);

    List<UserSummaryResponse> toSummaryResponseList(List<User> users);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "version",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted",   ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "roles",     ignore = true)  // handled in service
    @Mapping(target = "accountNonExpired",     ignore = true)
    @Mapping(target = "accountNonLocked",      ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    @Mapping(target = "profileImageUrl",       ignore = true)
    User toEntity(UserRequest request);

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
    @Mapping(target = "roles",     ignore = true)
    @Mapping(target = "accountNonExpired",     ignore = true)
    @Mapping(target = "accountNonLocked",      ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    @Mapping(target = "profileImageUrl",       ignore = true)
    void updateEntityFromRequest(UserRequest request, @MappingTarget User user);
}
