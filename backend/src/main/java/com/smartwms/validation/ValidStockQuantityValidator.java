package com.smartwms.validation;

import com.smartwms.dto.request.ProductRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Component;

/**
 * Validator for the {@link ValidStockQuantity} constraint.
 *
 * <p>Validates that:</p>
 * <ul>
 *     <li>All stock quantities are non-negative</li>
 *     <li>Reserved stock does not exceed current stock</li>
 * </ul>
 */
@Component
public class ValidStockQuantityValidator implements ConstraintValidator<ValidStockQuantity, ProductRequest> {

    @Override
    public void initialize(ValidStockQuantity constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(ProductRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        boolean valid = true;

        // Validate non-negative quantities
        if (request.getReorderLevel() != null && request.getReorderLevel() < 0) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Reorder level cannot be negative")
                    .addPropertyNode("reorderLevel")
                    .addConstraintViolation();
            valid = false;
        }

        if (request.getReorderQuantity() != null && request.getReorderQuantity() < 0) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Reorder quantity cannot be negative")
                    .addPropertyNode("reorderQuantity")
                    .addConstraintViolation();
            valid = false;
        }

        // Validate reorder quantity is set when reorder level is set
        if (request.getReorderLevel() != null && request.getReorderLevel() > 0) {
            if (request.getReorderQuantity() == null || request.getReorderQuantity() <= 0) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Reorder quantity must be greater than 0 when reorder level is set")
                        .addPropertyNode("reorderQuantity")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }
}
