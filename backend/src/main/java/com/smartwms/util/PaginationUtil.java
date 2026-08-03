package com.smartwms.util;

import com.smartwms.constants.AppConstants;
import lombok.experimental.UtilityClass;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility for building Spring Data {@link Pageable} objects from query parameters.
 *
 * <p>Enforces minimum/maximum page size bounds and safe sort direction parsing.</p>
 */
@UtilityClass
public class PaginationUtil {

    /**
     * Builds a {@link Pageable} from raw query parameters with validation.
     *
     * @param page      zero-based page index (clamped to {@code >= 0})
     * @param size      items per page (clamped to [1, MAX_PAGE_SIZE])
     * @param sortBy    field name to sort by (defaults to {@code id})
     * @param sortDir   sort direction — {@code "asc"} or {@code "desc"} (case-insensitive)
     */
    public static Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        int validPage = Math.max(0, page);
        int validSize = Math.min(Math.max(1, size), AppConstants.MAX_PAGE_SIZE);

        String field = (sortBy == null || sortBy.isBlank())
                ? AppConstants.DEFAULT_SORT_FIELD
                : sortBy.trim();

        Sort sort;
        try {
            Sort.Direction direction = Sort.Direction.fromString(
                    sortDir == null ? AppConstants.DEFAULT_SORT_DIR : sortDir.trim()
            );
            sort = Sort.by(direction, field);
        } catch (IllegalArgumentException ex) {
            sort = Sort.by(Sort.Direction.ASC, field);
        }

        return PageRequest.of(validPage, validSize, sort);
    }

    /**
     * Builds a {@link Pageable} with default values.
     * Equivalent to page=0, size=25, sort=id ASC.
     */
    public static Pageable defaultPageable() {
        return PageRequest.of(
                AppConstants.DEFAULT_PAGE,
                AppConstants.DEFAULT_PAGE_SIZE,
                Sort.by(Sort.Direction.ASC, AppConstants.DEFAULT_SORT_FIELD)
        );
    }

    /**
     * Builds an unpaged (all records) {@link Pageable} — use with caution on large datasets.
     */
    public static Pageable unpagedWith(String sortBy, String sortDir) {
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir == null ? "asc" : sortDir);
        } catch (IllegalArgumentException ex) {
            direction = Sort.Direction.ASC;
        }
        return PageRequest.of(0, AppConstants.MAX_PAGE_SIZE, Sort.by(direction, sortBy));
    }
}
