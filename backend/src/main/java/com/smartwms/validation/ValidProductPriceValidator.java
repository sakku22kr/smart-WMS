package com.smartwms.validation;

import com.smartwms.dto.request.ProductRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Validator for the {@link ValidProductPrice} constraint.
 *
 * <p>Validates that:</p>
 * <ul>
 *     <li>Selling price is greater than or equal to purchase price</li>
 *     <li>Tax rate is between 0 and 100</li>
 * </ul>
 */
@Component
public class ValidProductPriceValidator implements ConstraintValidator<ValidProductPrice, ProductRequest> {

    @Override
    public void initialize(ValidProductPrice constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(ProductRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        boolean valid = true;

        // Validate selling price >= purchase price
        if (request.getPurchasePrice() != null && request.getSellingPrice() != null) {
            if (request.getSellingPrice().compareTo(request.getPurchasePrice()) < 0) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Selling price must be greater than or equal to purchase price")
                        .addPropertyNode("sellingPrice")
                        .addConstraintViolation();
                valid = false;
            }
        }

        // Validate tax rate 0-100
        if (request.getTaxRate() != null) {
            BigDecimal taxRate = request.getTaxRate();
            if (taxRate.compareTo(BigDecimal.ZERO) < 0 || taxRate.compareTo(new BigDecimal("100")) > 0) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Tax rate must be between 0 and 100")
                        .addPropertyNode("taxRate")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }
}
