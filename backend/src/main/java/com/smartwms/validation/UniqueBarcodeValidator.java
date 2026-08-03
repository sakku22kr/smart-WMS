package com.smartwms.validation;

import com.smartwms.repository.ProductRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Validator for the {@link UniqueBarcode} constraint.
 *
 * <p>Checks whether the submitted barcode is already associated with any
 * active (non-soft-deleted) product in the database.</p>
 */
@Component
public class UniqueBarcodeValidator implements ConstraintValidator<UniqueBarcode, String> {

    private final ProductRepository productRepository;
    private long excludeId;

    @Autowired
    public UniqueBarcodeValidator(@Lazy ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void initialize(UniqueBarcode constraintAnnotation) {
        this.excludeId = constraintAnnotation.excludeId();
    }

    @Override
    public boolean isValid(String barcode, ConstraintValidatorContext context) {
        if (barcode == null || barcode.isBlank()) {
            return true; // Barcode is optional, let @NotBlank handle required
        }

        String normalizedBarcode = barcode.trim();

        if (excludeId > 0) {
            return !productRepository.existsByBarcodeAndIdNot(normalizedBarcode, excludeId);
        }

        return !productRepository.existsByBarcode(normalizedBarcode);
    }
}
