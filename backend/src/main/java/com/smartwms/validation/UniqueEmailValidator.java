package com.smartwms.validation;

import com.smartwms.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Validator for the {@link UniqueEmail} constraint.
 *
 * <p>Checks whether the submitted email is already associated with any
 * active (non-soft-deleted) user in the database.</p>
 *
 * <p>{@code @Lazy} on the repository injection avoids circular bean
 * dependency issues during Spring Security / JPA context initialization.</p>
 */
@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

    private final UserRepository userRepository;

    @Autowired
    public UniqueEmailValidator(@Lazy UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void initialize(UniqueEmail constraintAnnotation) {
        // No initialization needed
    }

    /**
     * Returns {@code true} (valid) if the email is blank (let @NotBlank handle it)
     * or if no user with this email exists in the database.
     */
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isBlank()) {
            return true;
        }
        return !userRepository.existsByEmail(email);
    }
}
