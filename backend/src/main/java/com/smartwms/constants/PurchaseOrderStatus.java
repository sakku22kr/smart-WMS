package com.smartwms.constants;

/**
 * Status lifecycle for purchase orders.
 *
 * <p>Flow: DRAFT → PENDING → APPROVED → ORDERED → RECEIVED → COMPLETED</p>
 * <p>Alternate: DRAFT/PENDING → REJECTED</p>
 * <p>From RECEIVED → PARTIALLY_RECEIVED (when partial delivery)</p>
 */
public enum PurchaseOrderStatus {

    DRAFT,
    PENDING,
    APPROVED,
    REJECTED,
    ORDERED,
    PARTIALLY_RECEIVED,
    RECEIVED,
    COMPLETED,
    CANCELLED
}
