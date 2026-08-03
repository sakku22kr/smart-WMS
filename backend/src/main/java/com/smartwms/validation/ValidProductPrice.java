package com.smartwms.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates product pricing rules:
 * - Selling price must be greater than or equal to purchase price
 * - Tax rate must be between 0 and 100
 *
 * <p>Apply to the ProductRequest class level.</p>
 *
 * <pre>
 * {@literal @}ValidProductPrice
 * public class ProductRequest { ... }
 * </pre>
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ValidProductPriceValidator.class)
public @interface ValidProductPrice {

    String message() default "Invalid product pricing";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
