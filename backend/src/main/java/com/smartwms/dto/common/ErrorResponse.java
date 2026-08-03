package com.smartwms.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Structured error details included in HTTP error responses.
 * Used internally by {@link com.smartwms.exception.GlobalExceptionHandler}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private int    status;
    private String errorCode;
    private String message;

    /**
     * Field-level validation errors — key: field name, value: error message.
     * Only populated for validation failures.
     */
    private Map<String, String> fieldErrors;

    private String path;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
