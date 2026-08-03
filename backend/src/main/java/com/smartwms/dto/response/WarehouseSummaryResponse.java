package com.smartwms.dto.response;

import lombok.*;

/**
 * Lightweight warehouse summary — used as a nested reference in other responses
 * to avoid loading the full entity graph.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseSummaryResponse {

    private Long   id;
    private String name;
    private String code;
    private String city;
}
