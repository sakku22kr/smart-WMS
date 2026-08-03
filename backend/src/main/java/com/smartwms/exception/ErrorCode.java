package com.smartwms.exception;

import lombok.Getter;

/**
 * Application-level error codes for structured error identification.
 * Each code has a unique prefix and a human-readable default message.
 */
@Getter
public enum ErrorCode {

    // ─── 4xx Client Errors ───────────────────────────────────
    RESOURCE_NOT_FOUND     ("ERR_001", "Resource not found"),
    DUPLICATE_RESOURCE     ("ERR_002", "Resource already exists"),
    VALIDATION_FAILED      ("ERR_003", "Validation failed"),
    BAD_REQUEST            ("ERR_004", "Bad request"),
    UNAUTHORIZED           ("ERR_005", "Authentication required"),
    FORBIDDEN              ("ERR_006", "Access forbidden"),
    TOKEN_EXPIRED          ("ERR_007", "Token has expired"),
    TOKEN_INVALID          ("ERR_008", "Token is invalid"),

    // ─── 5xx Server Errors ───────────────────────────────────
    INTERNAL_ERROR         ("ERR_500", "An unexpected error occurred"),
    DATABASE_ERROR         ("ERR_501", "A database error occurred"),

    // ─── Business / Domain Errors ────────────────────────────
    INSUFFICIENT_STOCK             ("ERR_B001", "Insufficient stock to complete this operation"),
    WAREHOUSE_AT_CAPACITY          ("ERR_B002", "Warehouse has reached maximum capacity"),
    INVALID_STATUS_TRANSITION      ("ERR_B003", "Invalid status transition"),
    CATEGORY_HAS_CHILDREN          ("ERR_B004", "Cannot delete a category that has sub-categories"),
    CATEGORY_HAS_PRODUCTS          ("ERR_B005", "Cannot delete a category that has associated products"),
    SUPPLIER_HAS_PRODUCTS          ("ERR_B006", "Cannot delete a supplier that has associated products"),
    WAREHOUSE_HAS_PRODUCTS         ("ERR_B007", "Cannot delete a warehouse that has associated products"),
    SELF_REFERENTIAL_PARENT        ("ERR_B008", "A category cannot be its own parent"),

    // ─── Product Validation Errors ──────────────────────────
    PRODUCT_DUPLICATE_SKU          ("ERR_P001", "A product with this SKU already exists"),
    PRODUCT_DUPLICATE_BARCODE      ("ERR_P002", "A product with this barcode already exists"),
    PRODUCT_DUPLICATE_NAME         ("ERR_P003", "A product with this name already exists in the same category and supplier"),
    PRODUCT_SELLING_PRICE_LOW      ("ERR_P004", "Selling price must be greater than or equal to purchase price"),
    PRODUCT_TAX_RATE_INVALID       ("ERR_P005", "Tax rate must be between 0 and 100"),
    PRODUCT_STOCK_NEGATIVE         ("ERR_P006", "Stock quantities cannot be negative"),
    PRODUCT_RESERVED_EXCEEDS_STOCK ("ERR_P007", "Reserved stock cannot exceed current stock"),
    PRODUCT_REORDER_INVALID        ("ERR_P008", "Reorder quantity must be greater than 0 when reorder level is set"),
    PRODUCT_CATEGORY_NOT_FOUND     ("ERR_P009", "Category not found or inactive"),
    PRODUCT_SUPPLIER_NOT_FOUND     ("ERR_P010", "Supplier not found or inactive"),
    PRODUCT_WAREHOUSE_NOT_FOUND    ("ERR_P011", "Warehouse not found or inactive"),
    PRODUCT_CANNOT_DELETE_RESERVED ("ERR_P012", "Cannot delete a product with reserved stock"),
    PRODUCT_CANNOT_DELETE_STOCK    ("ERR_P013", "Cannot delete a product with current stock"),
    PRODUCT_INACTIVE_CANNOT_ORDER  ("ERR_P014", "Cannot create orders for inactive products"),

    // ─── Inventory Validation Errors ────────────────────────
    INVENTORY_INVALID_TYPE         ("ERR_I001", "Invalid inventory transaction type"),
    INVENTORY_QUANTITY_REQUIRED    ("ERR_I002", "Quantity is required and must be positive"),
    INVENTORY_INSUFFICIENT_STOCK   ("ERR_I003", "Insufficient stock for this operation"),
    INVENTORY_TRANSFER_SELF        ("ERR_I004", "Cannot transfer to the same warehouse"),
    INVENTORY_TRANSFER_DESTINATION ("ERR_I005", "Destination warehouse not found"),
    INVENTORY_PRODUCT_NOT_FOUND    ("ERR_I006", "Product not found"),
    INVENTORY_WAREHOUSE_NOT_FOUND  ("ERR_I007", "Warehouse not found"),

    // ─── Purchase Order Errors ──────────────────────────────
    PO_DUPLICATE_ORDER_NUMBER      ("ERR_PO001", "A purchase order with this number already exists"),
    PO_CANNOT_EDIT                 ("ERR_PO002", "This purchase order cannot be edited in its current status"),
    PO_CANNOT_DELETE               ("ERR_PO003", "This purchase order cannot be deleted in its current status"),
    PO_NO_ITEMS                    ("ERR_PO004", "Purchase order must have at least one item"),
    PO_INVALID_STATUS              ("ERR_PO005", "Invalid purchase order status"),
    PO_SUPPLIER_NOT_FOUND          ("ERR_PO006", "Supplier not found"),
    PO_WAREHOUSE_NOT_FOUND         ("ERR_PO007", "Warehouse not found"),
    PO_PRODUCT_NOT_FOUND           ("ERR_PO008", "Product not found in order items"),
    PO_UNAUTHORIZED_ACTION         ("ERR_PO009", "You do not have permission to perform this action"),
    PO_STATUS_HISTORY_ERROR        ("ERR_PO010", "Failed to record status change"),
    PO_SUPPLIER_INACTIVE           ("ERR_PO011", "Cannot create/edit order for inactive or blacklisted supplier"),
    PO_PRODUCT_INACTIVE            ("ERR_PO012", "Cannot create/edit order for inactive or discontinued products"),
    PO_RECEIVE_EXCEEDED            ("ERR_PO013", "Cannot receive more than the remaining ordered quantity"),
    PO_INVENTORY_ALREADY_ADJUSTED  ("ERR_PO014", "Inventory already adjusted for this order");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
