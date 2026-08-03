package com.smartwms.dto.request;

import com.smartwms.constants.AppConstants;
import com.smartwms.constants.ProductStatus;
import com.smartwms.validation.UniqueBarcode;
import com.smartwms.validation.UniqueSku;
import com.smartwms.validation.ValidEntity;
import com.smartwms.validation.ValidProductPrice;
import com.smartwms.validation.ValidStockQuantity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating or updating a product")
@ValidProductPrice
@ValidStockQuantity
@ValidEntity
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 300, message = "Name must be between 2 and 300 characters")
    @Schema(description = "Product name", example = "Wireless Headset Pro X200", minLength = 2, maxLength = 300)
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(min = 3, max = 50, message = "SKU must be between 3 and 50 characters")
    @Pattern(regexp = AppConstants.Patterns.SKU, message = "SKU must contain only uppercase letters, digits, hyphens, or underscores")
    @UniqueSku(message = "A product with this SKU already exists")
    @Schema(description = "Stock Keeping Unit", example = "WH-X200", minLength = 3, maxLength = 50)
    private String sku;

    @Size(max = 100, message = "Barcode must not exceed 100 characters")
    @UniqueBarcode(message = "A product with this barcode already exists")
    @Schema(description = "Product barcode", example = "8901234567890")
    private String barcode;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Schema(description = "Product description", example = "Premium wireless headset with noise cancellation")
    private String description;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    @Schema(description = "Product brand", example = "AudioTech")
    private String brand;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    @Schema(description = "Product model", example = "AT-WH200")
    private String model;

    @Size(min = 1, max = 20, message = "Unit must be between 1 and 20 characters")
    @Schema(description = "Unit of measure", example = "PCS", defaultValue = "PCS")
    @Builder.Default
    private String unit = "PCS";

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase price must be greater than 0")
    @Schema(description = "Purchase price", example = "2500.00")
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    @Schema(description = "Selling price", example = "4999.00")
    private BigDecimal sellingPrice;

    @DecimalMin(value = "0.0", message = "Tax rate must be 0 or greater")
    @DecimalMax(value = "100.0", message = "Tax rate must not exceed 100")
    @Schema(description = "Tax rate percentage", example = "18.0", defaultValue = "0")
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level must be 0 or greater")
    @Schema(description = "Reorder level threshold", example = "10", defaultValue = "0")
    @Builder.Default
    private Integer reorderLevel = 0;

    @NotNull(message = "Reorder quantity is required")
    @Min(value = 0, message = "Reorder quantity must be 0 or greater")
    @Schema(description = "Default reorder quantity", example = "50", defaultValue = "0")
    @Builder.Default
    private Integer reorderQuantity = 0;

    @Size(max = 512, message = "Image URL must not exceed 512 characters")
    @Schema(description = "Product image URL", example = "https://example.com/images/headset.png")
    private String imageUrl;

    @Schema(description = "Product status", defaultValue = "ACTIVE")
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Supplier ID", example = "1")
    private Long supplierId;

    @Schema(description = "Warehouse ID", example = "1")
    private Long warehouseId;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Schema(description = "Additional notes", example = "Fragile item, handle with care")
    private String notes;
}
