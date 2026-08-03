package com.smartwms.dto.response;

import com.smartwms.constants.SupplierStatus;
import lombok.*;

/**
 * Lightweight supplier summary — used as a nested reference in ProductResponse.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierSummaryResponse {

    private Long   id;
    private String name;
    private String code;
    private String companyName;
    private SupplierStatus status;
}
