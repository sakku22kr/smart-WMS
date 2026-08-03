package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating or updating a category")
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    @Schema(description = "Category name", example = "Electronics", minLength = 2, maxLength = 150)
    private String name;

    @NotBlank(message = "Category code is required")
    @Size(min = 2, max = 30, message = "Code must be between 2 and 30 characters")
    @Pattern(regexp = AppConstants.Patterns.CODE, message = "Code must contain only uppercase letters, digits, hyphens, or underscores")
    @Schema(description = "Unique category code", example = "ELEC", minLength = 2, maxLength = 30)
    private String code;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Brief description of the category", example = "All electronic products and gadgets")
    private String description;

    @Size(max = 512, message = "Image URL must not exceed 512 characters")
    @Schema(description = "Category image URL", example = "https://example.com/images/electronics.png")
    private String imageUrl;

    @Schema(description = "Display sort order", example = "1", defaultValue = "0")
    @Min(value = 0, message = "Sort order must be 0 or greater")
    @Builder.Default
    private Integer sortOrder = 0;

    @Schema(description = "Category status", defaultValue = "ACTIVE")
    @Builder.Default
    private com.smartwms.constants.CategoryStatus status = com.smartwms.constants.CategoryStatus.ACTIVE;

    @Schema(description = "Parent category ID (null for root categories)", example = "null")
    private Long parentId;
}
