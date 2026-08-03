package com.smartwms.controller;

import com.smartwms.constants.AppConstants;
import com.smartwms.dto.common.ApiResponse;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ActivityLogResponse;
import com.smartwms.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Activity Log operations.
 *
 * <p>Base path: {@code /api/v1/activity-logs}</p>
 * <p>All endpoints require {@code ROLE_ADMIN} authorization.</p>
 */
@RestController
@RequestMapping(AppConstants.API_V1 + "/activity-logs")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Activity Logs", description = "Activity audit log endpoints (Admin only)")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @Operation(summary = "List All Activity Logs", description = "Paginated list of all system activity logs, newest first.")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {
        log.info("GET /activity-logs — page={}, size={}", page, size);
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getAll(page, size)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get Activity Logs by User", description = "Paginated list of activities performed by a specific user.")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {
        log.info("GET /activity-logs/user/{} — page={}, size={}", userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getByUserId(userId, page, size)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get Recent Activity Logs", description = "Returns the last 50 activity log entries.")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getRecent() {
        log.info("GET /activity-logs/recent");
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getRecent()));
    }

    @GetMapping("/target/{targetUserId}")
    @Operation(summary = "Get Activity Logs by Target Entity", description = "Paginated activity logs for a specific target entity (e.g., category ID).")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getByTargetUserId(
            @PathVariable Long targetUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /activity-logs/target/{} — page={}, size={}", targetUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getByTargetUserId(targetUserId, page, size)));
    }
}
