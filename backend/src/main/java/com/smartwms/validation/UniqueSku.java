package com.smartwms.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the annotated SKU is unique among active (non-deleted) products.
 *
 * <p>Apply to create-request fields only. For update operations, use the
 * {@code excludeId} attribute to exclude the current product from the check.</p>
 *
 * <pre>
 * {@literal @}UniqueSku
 * private String sku;
 * </pre>
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = UniqueSkuValidator.class)
public @interface UniqueSku {

    String message() default "A product with this SKU already exists";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * The product ID to exclude from uniqueness check (for update operations).
     * Default is -1 (no exclusion).
     */
    long excludeId() default -1L;
}
