package com.smartwms.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates stock quantity rules:
 * - All stock quantities (currentStock, reservedStock, reorderLevel, reorderQuantity) must be non-negative
 * - Reserved stock cannot exceed current stock
 *
 * <p>Apply to the ProductRequest class level.</p>
 *
 * <pre>
 * {@literal @}ValidStockQuantity
 * public class ProductRequest { ... }
 * </pre>
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ValidStockQuantityValidator.class)
public @interface ValidStockQuantity {

    String message() default "Invalid stock quantities";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
