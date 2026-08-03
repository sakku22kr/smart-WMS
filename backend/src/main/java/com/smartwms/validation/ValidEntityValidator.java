package com.smartwms.validation;

import com.smartwms.dto.request.ProductRequest;
import com.smartwms.entity.Category;
import com.smartwms.entity.Supplier;
import com.smartwms.entity.Warehouse;
import com.smartwms.constants.CategoryStatus;
import com.smartwms.constants.SupplierStatus;
import com.smartwms.constants.WarehouseStatus;
import com.smartwms.repository.CategoryRepository;
import com.smartwms.repository.SupplierRepository;
import com.smartwms.repository.WarehouseRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Validator for the {@link ValidEntity} constraint.
 *
 * <p>Validates that referenced Category, Supplier, and Warehouse exist and are active.</p>
 */
@Component
public class ValidEntityValidator implements ConstraintValidator<ValidEntity, ProductRequest> {

    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;

    @Autowired
    public ValidEntityValidator(
            @Lazy CategoryRepository categoryRepository,
            @Lazy SupplierRepository supplierRepository,
            @Lazy WarehouseRepository warehouseRepository) {
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    public void initialize(ValidEntity constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(ProductRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        boolean valid = true;

        // Validate category exists and is active
        if (request.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            if (categoryOpt.isEmpty()) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Category not found with id: " + request.getCategoryId())
                        .addPropertyNode("categoryId")
                        .addConstraintViolation();
                valid = false;
            } else if (categoryOpt.get().getStatus() != CategoryStatus.ACTIVE) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Category is not active")
                        .addPropertyNode("categoryId")
                        .addConstraintViolation();
                valid = false;
            }
        }

        // Validate supplier exists and is active
        if (request.getSupplierId() != null) {
            Optional<Supplier> supplierOpt = supplierRepository.findById(request.getSupplierId());
            if (supplierOpt.isEmpty()) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Supplier not found with id: " + request.getSupplierId())
                        .addPropertyNode("supplierId")
                        .addConstraintViolation();
                valid = false;
            } else if (supplierOpt.get().getStatus() != SupplierStatus.ACTIVE) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Supplier is not active")
                        .addPropertyNode("supplierId")
                        .addConstraintViolation();
                valid = false;
            }
        }

        // Validate warehouse exists and is active
        if (request.getWarehouseId() != null) {
            Optional<Warehouse> warehouseOpt = warehouseRepository.findById(request.getWarehouseId());
            if (warehouseOpt.isEmpty()) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Warehouse not found with id: " + request.getWarehouseId())
                        .addPropertyNode("warehouseId")
                        .addConstraintViolation();
                valid = false;
            } else if (warehouseOpt.get().getStatus() != WarehouseStatus.ACTIVE) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Warehouse is not active")
                        .addPropertyNode("warehouseId")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }
}
