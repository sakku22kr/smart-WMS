package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregated product audit statistics")
public class ProductAuditStatsResponse {

    @Schema(description = "Total number of audit events for the product")
    private long totalEvents;

    @Schema(description = "Number of events per event type")
    private List<EventTypeCount> eventsByType;

    @Schema(description = "Number of distinct users who performed actions")
    private long distinctUsers;

    @Schema(description = "Most recent activity timestamp")
    private String lastActivityAt;

    @Schema(description = "User who performed the most recent action")
    private String lastPerformedBy;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Event type and its count")
    public static class EventTypeCount {
        private String eventType;
        private long count;
    }
}
