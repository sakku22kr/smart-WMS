package com.smartwms.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the annotated email address is not already registered
 * by any active (non-deleted) user in the database.
 *
 * <p>Apply to create-request fields only. For update operations, the service
 * layer must perform the uniqueness check while excluding the current entity's ID.</p>
 *
 * <pre>
 * {@literal @}UniqueEmail
 * {@literal @}Email
 * private String email;
 * </pre>
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {

    String message() default "Email address is already registered";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
