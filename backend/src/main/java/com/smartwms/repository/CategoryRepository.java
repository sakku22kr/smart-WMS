package com.smartwms.repository;

import com.smartwms.constants.CategoryStatus;
import com.smartwms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    Optional<Category> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<Category> findByParentId(Long parentId);

    List<Category> findByParentIsNull();

    long countByStatus(CategoryStatus status);

    long countByParentId(Long parentId);

    long countByParentIsNull();

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL ORDER BY c.sortOrder ASC, c.name ASC")
    List<Category> findRootCategories();

    @Query("SELECT c FROM Category c ORDER BY c.sortOrder ASC, c.name ASC")
    List<Category> findAllOrdering();

    @Query(value = "SELECT * FROM categories WHERE deleted = true ORDER BY deleted_at DESC", nativeQuery = true)
    List<Category> findAllDeleted();

    @Query(value = "SELECT * FROM categories WHERE deleted = true AND (LOWER(name) LIKE %:search% OR LOWER(code) LIKE %:search%) ORDER BY deleted_at DESC", nativeQuery = true)
    List<Category> findDeletedBySearch(@Param("search") String search);
}
