package com.smartwms.dto.common;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated response wrapper for list endpoints.
 *
 * <p>Use {@link #from(Page)} to build from a Spring {@code Page} object.</p>
 *
 * @param <T> the type of items in the page
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;

    /** Zero-based page number. */
    private int page;

    /** Number of items requested per page. */
    private int size;

    /** Total number of records matching the query (across all pages). */
    private long totalElements;

    /** Total number of pages. */
    private int totalPages;

    private boolean first;
    private boolean last;
    private boolean empty;

    /**
     * Builds a {@code PageResponse} from a Spring Data {@code Page} object.
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}
