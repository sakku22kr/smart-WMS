package com.smartwms.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a domain/business rule is violated.
 *
 * <p>Results in HTTP 422 Unprocessable Entity.</p>
 *
 * <pre>
 * throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK);
 * throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Only 5 units remain in stock");
 * </pre>
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
}
