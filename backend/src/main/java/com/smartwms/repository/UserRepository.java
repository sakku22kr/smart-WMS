package com.smartwms.repository;

import com.smartwms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for {@link User} entities.
 *
 * <p>All standard queries automatically exclude soft-deleted users
 * via the {@code @SQLRestriction("deleted = false")} on the entity.</p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>,
                                         JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Used for update uniqueness check: email must be unique excluding the current user. */
    boolean existsByEmailAndIdNot(String email, Long id);

    /** Used for custom password reset flows that need to verify the email exists. */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.enabled = true")
    boolean existsByEmailAndEnabledTrue(@Param("email") String email);
}
