package com.smartwms.service;

import com.smartwms.constants.ActivityType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ActivityLogResponse;

/**
 * Service contract for Activity Log operations.
 */
public interface ActivityLogService {

    /** Log an activity. */
    void log(ActivityType type, Long userId, String actorEmail, String actorName,
             Long targetUserId, String targetUserName, String description,
             String ipAddress, String metadata);

    /** Get paginated activity logs (all). */
    PageResponse<ActivityLogResponse> getAll(int page, int size);

    /** Get paginated activity logs for a specific user. */
    PageResponse<ActivityLogResponse> getByUserId(Long userId, int page, int size);

    /** Get recent activity logs (last 50). */
    java.util.List<ActivityLogResponse> getRecent();

    /** Get paginated activity logs for a specific target entity (by targetUserId). */
    PageResponse<ActivityLogResponse> getByTargetUserId(Long targetUserId, int page, int size);
}
