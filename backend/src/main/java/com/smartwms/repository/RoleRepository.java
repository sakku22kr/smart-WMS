package com.smartwms.repository;

import com.smartwms.entity.Role;
import com.smartwms.constants.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Role} entities.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);

    List<Role> findByActiveTrue();
}
