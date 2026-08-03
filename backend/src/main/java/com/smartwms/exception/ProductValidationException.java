package com.smartwms.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;

/**
 * Thrown when product-specific business validation fails.
 *
 * <p>Results in HTTP 400 Bad Request with detailed field errors.</p>
 */
@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ProductValidationException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Map<String, String> errors;

    public ProductValidationException(ErrorCode errorCode, Map<String, String> errors) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.errors = errors;
    }

    public ProductValidationException(ErrorCode errorCode, String message, Map<String, String> errors) {
        super(message);
        this.errorCode = errorCode;
        this.errors = errors;
    }
}
