package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.CategoryRequest;
import com.smartwms.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    PageResponse<CategoryResponse> getAllCategories(
            int page, int size, String sort, String direction,
            String search, String status, Long parentId);

    CategoryResponse getCategoryById(Long id);

    CategoryResponse getCategoryByCode(String code);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void restoreCategory(Long id);

    CategoryResponse activateCategory(Long id);

    CategoryResponse deactivateCategory(Long id);

    boolean isCodeAvailable(String code, Long excludeId);

    List<CategoryResponse> getRootCategories();

    List<CategoryResponse> getSubCategories(Long parentId);

    List<CategoryResponse> getCategoryTree();

    List<CategoryResponse> getCategoryPath(Long id);

    List<CategoryResponse> getDeletedCategories(String search);
}
