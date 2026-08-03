package com.smartwms.service;

import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.request.HistoryRequest;
import com.smartwms.dto.response.HistorySummaryResponse;
import com.smartwms.dto.response.InventoryResponse;

/**
 * Service for querying inventory transaction history with flexible filtering.
 */
public interface InventoryHistoryService {

    /**
     * Get paginated, filtered inventory transaction history.
     */
    PageResponse<InventoryResponse> getHistory(HistoryRequest request);

    /**
     * Get summary statistics for filtered history.
     */
    HistorySummaryResponse getHistorySummary(HistoryRequest request);
}
