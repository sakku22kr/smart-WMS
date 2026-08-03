package com.smartwms.constants;

/**
 * Types of inventory transactions tracked in the system.
 */
public enum InventoryTransactionType {
    STOCK_IN,
    STOCK_OUT,
    ADJUSTMENT,
    TRANSFER,
    RESERVED,
    RELEASED,
    DISPATCHED,
    RETURNED,
    DAMAGED,
    EXPIRED
}
