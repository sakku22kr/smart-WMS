package com.smartwms.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response for top products by stock quantity.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String category;
    private Integer currentStock;
    private Integer reorderLevel;
    private BigDecimal sellingPrice;
    private BigDecimal inventoryValue;
}
