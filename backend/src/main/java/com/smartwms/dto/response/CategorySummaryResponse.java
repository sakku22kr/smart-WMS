package com.smartwms.dto.response;

import com.smartwms.constants.CategoryStatus;
import lombok.*;

/**
 * Lightweight category summary — used as a nested reference in other responses.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryResponse {

    private Long   id;
    private String name;
    private String code;
    private CategoryStatus status;
}
