package com.smartwms.validation;

import com.smartwms.repository.ProductRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Validator for the {@link UniqueSku} constraint.
 *
 * <p>Checks whether the submitted SKU is already associated with any
 * active (non-soft-deleted) product in the database.</p>
 */
@Component
public class UniqueSkuValidator implements ConstraintValidator<UniqueSku, String> {

    private final ProductRepository productRepository;
    private long excludeId;

    @Autowired
    public UniqueSkuValidator(@Lazy ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void initialize(UniqueSku constraintAnnotation) {
        this.excludeId = constraintAnnotation.excludeId();
    }

    @Override
    public boolean isValid(String sku, ConstraintValidatorContext context) {
        if (sku == null || sku.isBlank()) {
            return true; // Let @NotBlank handle null/blank
        }

        String normalizedSku = sku.trim().toUpperCase();

        if (excludeId > 0) {
            return !productRepository.existsBySkuAndIdNot(normalizedSku, excludeId);
        }

        return !productRepository.existsBySku(normalizedSku);
    }
}
