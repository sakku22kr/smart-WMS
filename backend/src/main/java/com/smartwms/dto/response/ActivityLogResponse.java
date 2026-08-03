package com.smartwms.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response payload for activity log entries.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Activity log entry")
public class ActivityLogResponse {

    @Schema(description = "Unique log identifier", example = "1")
    private Long id;

    @Schema(description = "Type of activity", example = "USER_ACTIVATED")
    private String activityType;

    @Schema(description = "User ID who performed the action")
    private Long userId;

    @Schema(description = "Email of the actor", example = "admin@smartwms.io")
    private String actorEmail;

    @Schema(description = "Name of the actor", example = "Admin User")
    private String actorName;

    @Schema(description = "Target user ID (if applicable)")
    private Long targetUserId;

    @Schema(description = "Target user name (if applicable)")
    private String targetUserName;

    @Schema(description = "Human-readable description of the activity")
    private String description;

    @Schema(description = "IP address of the actor")
    private String ipAddress;

    @Schema(description = "Additional metadata as JSON")
    private String metadata;

    @Schema(description = "Timestamp when the activity occurred")
    private LocalDateTime createdAt;
}
