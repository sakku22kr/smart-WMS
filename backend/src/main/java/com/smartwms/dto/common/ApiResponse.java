package com.smartwms.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smartwms.constants.AppConstants;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Unified API response envelope for all REST endpoints.
 *
 * <p>All controller methods return this type to ensure consistent structure.
 * Null fields are omitted from the serialized JSON.</p>
 *
 * @param <T> the type of the payload data
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private String  errorCode;
    private T       data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // ─── Static Factories ─────────────────────────────────────

    /** Success response with payload. */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(AppConstants.Messages.SUCCESS)
                .data(data)
                .build();
    }

    /** Success response with custom message and payload. */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /** Success response with message only (no payload). */
    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();
    }

    /** Error response with message and error code. */
    public static ApiResponse<Void> error(String message, String errorCode) {
        return ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }

    /** Error response with message, error code, and details payload. */
    public static <T> ApiResponse<T> error(String message, String errorCode, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .data(data)
                .build();
    }
}
