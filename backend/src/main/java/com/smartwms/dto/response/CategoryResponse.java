package com.smartwms.dto.response;

import com.smartwms.constants.CategoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Category response payload")
public class CategoryResponse {

    @Schema(description = "Unique category identifier", example = "1")
    private Long id;

    @Schema(description = "Category name", example = "Electronics")
    private String name;

    @Schema(description = "Unique category code", example = "ELEC")
    private String code;

    @Schema(description = "Category description", example = "All electronic products and gadgets")
    private String description;

    @Schema(description = "Category image URL")
    private String imageUrl;

    @Schema(description = "Display sort order", example = "1")
    private Integer sortOrder;

    @Schema(description = "Category status", example = "ACTIVE")
    private CategoryStatus status;

    @Schema(description = "Parent category ID", example = "null")
    private Long parentId;

    @Schema(description = "Parent category name", example = "Root Category")
    private String parentName;

    @Schema(description = "Number of direct child categories", example = "3")
    private Long childCount;

    @Schema(description = "Number of products in this category", example = "42")
    private Long productCount;

    @Schema(description = "Hierarchy level (0 = root)", example = "0")
    private Integer level;

    @Schema(description = "Nested child categories (tree view only)")
    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();

    @Schema(description = "Breadcrumb path (path view only)")
    @Builder.Default
    private List<CategoryResponse> path = new ArrayList<>();

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "User who created this record")
    private String createdBy;
}
