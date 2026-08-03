package com.smartwms.dto.response;

import com.smartwms.constants.ProductStatus;
import lombok.*;

/**
 * Compact product response used in the Dashboard low-stock alert list
 * and other summary views.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockProductResponse {

    private Long   id;
    private String name;
    private String sku;
    private String brand;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private Integer availableStock;
    private ProductStatus status;

    private CategorySummaryResponse  category;
    private WarehouseSummaryResponse warehouse;
}
