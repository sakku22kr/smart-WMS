package com.smartwms.mapper;

import com.smartwms.dto.request.CategoryRequest;
import com.smartwms.dto.response.CategoryResponse;
import com.smartwms.entity.Category;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CategoryMapper {

    @Mapping(target = "parentId", expression = "java(getParentId(category))")
    @Mapping(target = "parentName", expression = "java(getParentName(category))")
    @Mapping(target = "childCount", expression = "java((long) category.getChildren().size())")
    @Mapping(target = "productCount", ignore = true)
    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "parent", ignore = true)
    Category toEntity(CategoryRequest request);

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
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "parent", ignore = true)
    void updateEntityFromRequest(CategoryRequest request, @MappingTarget Category category);

    default Long getParentId(Category category) {
        if (category == null || category.getParent() == null) return null;
        return category.getParent().getId();
    }

    default String getParentName(Category category) {
        if (category == null || category.getParent() == null) return null;
        return category.getParent().getName();
    }
}
