package com.smartwms.constants;

/**
 * Application-wide constants. All members are public static final.
 * This class is not instantiable.
 */
public final class AppConstants {

    private AppConstants() {}

    // ─── API ──────────────────────────────────────────────────
    public static final String API_V1             = "/api/v1";
    public static final String BEARER_PREFIX      = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String SYSTEM_USER        = "system";

    // ─── Pagination ───────────────────────────────────────────
    public static final int DEFAULT_PAGE       = 0;
    public static final int DEFAULT_PAGE_SIZE  = 25;
    public static final int MAX_PAGE_SIZE      = 100;
    public static final String DEFAULT_SORT_DIR   = "asc";
    public static final String DEFAULT_SORT_FIELD = "id";

    // ─── Date / Time ──────────────────────────────────────────
    public static final String DATE_FORMAT      = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT  = "yyyy-MM-dd HH:mm:ss";

    // ─── Response Messages ────────────────────────────────────
    public static final class Messages {
        private Messages() {}
        public static final String SUCCESS             = "Operation completed successfully";
        public static final String CREATED             = "Resource created successfully";
        public static final String UPDATED             = "Resource updated successfully";
        public static final String DELETED             = "Resource deleted successfully";
        public static final String RESOURCE_NOT_FOUND  = "Resource not found";
        public static final String DUPLICATE_RESOURCE  = "Resource already exists";
        public static final String VALIDATION_FAILED   = "Validation failed";
        public static final String UNAUTHORIZED        = "Authentication required";
        public static final String FORBIDDEN           = "Access denied";
        public static final String INTERNAL_ERROR      = "An unexpected error occurred. Please try again later.";
    }

    // ─── Regex Patterns ───────────────────────────────────────
    public static final class Patterns {
        private Patterns() {}
        public static final String CODE    = "^[A-Z0-9_-]+$";
        public static final String SKU     = "^[A-Z0-9_-]{3,50}$";
        public static final String PHONE   = "^[+]?[0-9\\s\\-().]{7,20}$";
        public static final String GSTIN   = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$";
        public static final String IFSC    = "^[A-Z]{4}0[A-Z0-9]{6}$";
        public static final String PAN     = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$";
    }
}
