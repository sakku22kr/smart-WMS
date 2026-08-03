package com.smartwms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response for inventory value breakdown.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryValueResponse {

    private BigDecimal totalInventoryValue;
    private BigDecimal totalStockValue;
    private List<CategoryValueItem> valueByCategory;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryValueItem {
        private String categoryName;
        private BigDecimal value;
        private long productCount;
    }
}
