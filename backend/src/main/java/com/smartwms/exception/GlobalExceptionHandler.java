package com.smartwms.exception;

import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for all REST controllers.
 *
 * <p>Converts exceptions into structured {@link ApiResponse} payloads with
 * consistent HTTP status codes, error codes, and messages.</p>
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ─── Domain Exceptions ────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found [{}]: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), ErrorCode.RESOURCE_NOT_FOUND.getCode()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {
        log.warn("Duplicate resource [{}]: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage(), ErrorCode.DUPLICATE_RESOURCE.getCode()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {
        log.warn("Business rule violation [{}]: {} ({})", request.getRequestURI(),
                ex.getMessage(), ex.getErrorCode().getCode());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode().getCode()));
    }

    // ─── Product-specific Validation Exceptions ──────────────

    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleProductValidation(
            ProductValidationException ex, HttpServletRequest request) {
        log.warn("Product validation failed [{}]: {}", request.getRequestURI(), ex.getErrors());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        "Product validation failed",
                        ex.getErrorCode().getCode(),
                        ex.getErrors()));
    }

    // ─── Validation Exceptions ────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation failed — {} field error(s): {}", fieldErrors.size(), fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        ErrorCode.VALIDATION_FAILED.getDefaultMessage(),
                        ErrorCode.VALIDATION_FAILED.getCode(),
                        fieldErrors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .collect(Collectors.joining("; "));
        log.warn("Constraint violation: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, ErrorCode.VALIDATION_FAILED.getCode()));
    }

    // ─── HTTP / Request Exceptions ───────────────────────────

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {
        String message = "Invalid or malformed request body: " + ex.getMostSpecificCause().getMessage();
        log.warn("Unreadable HTTP message: {}", ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, ErrorCode.BAD_REQUEST.getCode()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        String message = String.format(
                "Parameter '%s' should be of type '%s'",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, ErrorCode.BAD_REQUEST.getCode()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex) {
        String message = String.format("Required parameter '%s' of type '%s' is missing",
                ex.getParameterName(), ex.getParameterType());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, ErrorCode.BAD_REQUEST.getCode()));
    }

    // ─── Security Exceptions ─────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ErrorCode.FORBIDDEN.getDefaultMessage(),
                        ErrorCode.FORBIDDEN.getCode()));
    }

    // ─── Generic Fallback ─────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        ErrorCode.INTERNAL_ERROR.getDefaultMessage(),
                        ErrorCode.INTERNAL_ERROR.getCode()));
    }
}
