package com.smartwms.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that an entity (Category, Supplier, Warehouse) exists and is active.
 *
 * <p>Apply to the ProductRequest class level.</p>
 *
 * <pre>
 * {@literal @}ValidEntity
 * public class ProductRequest { ... }
 * </pre>
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ValidEntityValidator.class)
public @interface ValidEntity {

    String message() default "Referenced entity not found or inactive";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
