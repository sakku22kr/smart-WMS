package com.smartwms.service.impl;

import com.smartwms.constants.ActivityType;
import com.smartwms.constants.AppConstants;
import com.smartwms.constants.CategoryStatus;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.CategoryRequest;
import com.smartwms.dto.response.CategoryResponse;
import com.smartwms.entity.Category;
import com.smartwms.exception.BusinessException;
import com.smartwms.exception.DuplicateResourceException;
import com.smartwms.exception.ErrorCode;
import com.smartwms.exception.ResourceNotFoundException;
import com.smartwms.mapper.CategoryMapper;
import com.smartwms.repository.CategoryRepository;
import com.smartwms.repository.ProductRepository;
import com.smartwms.service.ActivityLogService;
import com.smartwms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ProductRepository productRepository;
    private final ActivityLogService activityLogService;

    // ─── Create ───────────────────────────────────────────────

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        String code = request.getCode().trim().toUpperCase();
        String name = request.getName().trim();

        if (categoryRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        Category category = categoryMapper.toEntity(request);
        category.setCode(code);
        category.setName(name);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "parentId", request.getParentId()));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_CREATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Category created: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Category created: {} (id={})", saved.getCode(), saved.getId());
        return toResponseWithProductCount(saved);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponseWithProductCount(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByCode(String code) {
        Category category = categoryRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "code", code));
        return toResponseWithProductCount(category);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAllCategories(
            int page, int size, String sort, String direction,
            String search, String status, Long parentId) {

        Sort sortObj = direction.equalsIgnoreCase(AppConstants.DEFAULT_SORT_DIR)
                ? Sort.by(sort).ascending()
                : Sort.by(sort).descending();

        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sortObj);

        Specification<Category> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (search != null && !search.isBlank()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), keyword),
                    cb.like(cb.lower(root.get("code")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
                ));
            }

            if (status != null && !status.isBlank()) {
                try {
                    CategoryStatus categoryStatus = CategoryStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), categoryStatus));
                } catch (IllegalArgumentException e) {
                    predicates.add(cb.equal(root.get("status"), null));
                }
            }

            if (parentId != null) {
                if (parentId == 0L) {
                    predicates.add(cb.isNull(root.get("parent")));
                } else {
                    predicates.add(cb.equal(root.get("parent").get("id"), parentId));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Category> categoryPage = categoryRepository.findAll(spec, pageable);
        Page<CategoryResponse> responsePage = categoryPage.map(this::toResponseWithProductCount);
        return PageResponse.from(responsePage);
    }

    // ─── Update ───────────────────────────────────────────────

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);

        String code = request.getCode().trim().toUpperCase();
        String name = request.getName().trim();

        if (categoryRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }
        if (categoryRepository.existsByNameAndIdNot(name, id)) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        categoryMapper.updateEntityFromRequest(request, category);
        category.setCode(code);
        category.setName(name);

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException(ErrorCode.SELF_REFERENTIAL_PARENT, "A category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "parentId", request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_UPDATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Category updated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Category updated: {} (id={})", saved.getCode(), saved.getId());
        return toResponseWithProductCount(saved);
    }

    // ─── Delete ───────────────────────────────────────────────

    @Override
    public void deleteCategory(Long id) {
        Category category = findById(id);

        long childCount = categoryRepository.countByParentId(id);
        if (childCount > 0) {
            throw new BusinessException(
                ErrorCode.CATEGORY_HAS_CHILDREN,
                "Cannot delete category '" + category.getName()
                    + "' — it still contains " + childCount + " sub-category(ies)."
            );
        }

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BusinessException(
                ErrorCode.CATEGORY_HAS_PRODUCTS,
                "Cannot delete category '" + category.getName()
                    + "' — it still contains " + productCount + " product(s)."
            );
        }

        String code = category.getCode();
        String name = category.getName();
        category.softDelete("system");
        categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_DELETED, null, AppConstants.SYSTEM_USER, "System",
            id, name,
            "Category soft-deleted: " + code + " - " + name,
            null, null
        );
        log.info("Category soft-deleted: {} (id={})", code, id);
    }

    @Override
    public void restoreCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (!category.isDeleted()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Category is not deleted");
        }
        category.restore();
        Category saved = categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_RESTORED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Category restored: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Category restored: {} (id={})", saved.getCode(), id);
    }

    // ─── Status Management ────────────────────────────────────

    @Override
    public CategoryResponse activateCategory(Long id) {
        Category category = findById(id);
        if (category.getStatus() == CategoryStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Category is already active");
        }
        category.setStatus(CategoryStatus.ACTIVE);
        Category saved = categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_ACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Category activated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Category activated: {} (id={})", saved.getCode(), id);
        return toResponseWithProductCount(saved);
    }

    @Override
    public CategoryResponse deactivateCategory(Long id) {
        Category category = findById(id);
        if (category.getStatus() == CategoryStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Category is already inactive");
        }
        category.setStatus(CategoryStatus.INACTIVE);
        Category saved = categoryRepository.save(category);
        activityLogService.log(
            ActivityType.CATEGORY_DEACTIVATED, null, AppConstants.SYSTEM_USER, "System",
            saved.getId(), saved.getName(),
            "Category deactivated: " + saved.getCode() + " - " + saved.getName(),
            null, null
        );
        log.info("Category deactivated: {} (id={})", saved.getCode(), id);
        return toResponseWithProductCount(saved);
    }

    // ─── Query Helpers ────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findRootCategories().stream()
                .map(this::toResponseWithProductCount)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::toResponseWithProductCount)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCodeAvailable(String code, Long excludeId) {
        if (code == null || code.isBlank()) return false;
        String normalized = code.trim().toUpperCase();
        if (excludeId != null) {
            return !categoryRepository.existsByCodeAndIdNot(normalized, excludeId);
        }
        return !categoryRepository.existsByCode(normalized);
    }

    // ─── Tree & Hierarchy ─────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<Category> all = categoryRepository.findAllOrdering();

        Map<Long, CategoryResponse> responseMap = new LinkedHashMap<>();
        for (Category cat : all) {
            CategoryResponse resp = toResponseWithProductCount(cat);
            resp.setLevel(computeLevel(cat));
            resp.setChildren(new ArrayList<>());
            responseMap.put(cat.getId(), resp);
        }

        List<CategoryResponse> roots = new ArrayList<>();
        for (Category cat : all) {
            CategoryResponse resp = responseMap.get(cat.getId());
            if (cat.getParent() == null) {
                roots.add(resp);
            } else {
                CategoryResponse parentResp = responseMap.get(cat.getParent().getId());
                if (parentResp != null) {
                    parentResp.getChildren().add(resp);
                }
            }
        }
        return roots;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryPath(Long id) {
        Category category = findById(id);
        List<CategoryResponse> path = new ArrayList<>();
        Category current = category;
        while (current != null) {
            path.add(toResponseWithProductCount(current));
            current = current.getParent();
        }
        Collections.reverse(path);
        return path;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getDeletedCategories(String search) {
        List<Category> deleted;
        if (search != null && !search.isBlank()) {
            deleted = categoryRepository.findDeletedBySearch(search.trim().toLowerCase());
        } else {
            deleted = categoryRepository.findAllDeleted();
        }
        return deleted.stream()
                .map(this::toResponseWithProductCount)
                .collect(Collectors.toList());
    }

    // ─── Private Helpers ──────────────────────────────────────

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryResponse toResponseWithProductCount(Category category) {
        CategoryResponse response = categoryMapper.toResponse(category);
        long productCount = productRepository.countByCategoryId(category.getId());
        response.setProductCount(productCount);
        return response;
    }

    private int computeLevel(Category category) {
        int level = 0;
        Category current = category;
        while (current.getParent() != null) {
            level++;
            current = current.getParent();
        }
        return level;
    }
}
