package com.smartwms.constants;

/**
 * Stock health status derived from current stock vs reorder level.
 */
public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK,
    OVERSTOCKED
}
