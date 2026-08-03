package com.smartwms.service.impl;

import com.smartwms.constants.ActivityType;
import com.smartwms.dto.common.PageResponse;
import com.smartwms.dto.response.ActivityLogResponse;
import com.smartwms.entity.ActivityLog;
import com.smartwms.mapper.ActivityLogMapper;
import com.smartwms.repository.ActivityLogRepository;
import com.smartwms.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link ActivityLogService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogMapper     activityLogMapper;

    @Override
    public void log(ActivityType type, Long userId, String actorEmail, String actorName,
                    Long targetUserId, String targetUserName, String description,
                    String ipAddress, String metadata) {
        ActivityLog entry = ActivityLog.builder()
                .activityType(type)
                .userId(userId)
                .actorEmail(actorEmail)
                .actorName(actorName)
                .targetUserId(targetUserId)
                .targetUserName(targetUserName)
                .description(description)
                .ipAddress(ipAddress)
                .metadata(metadata)
                .build();
        activityLogRepository.save(entry);
        log.info("Activity logged: {} by {} → {}", type, actorEmail, description);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<ActivityLog> logPage = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        Page<ActivityLogResponse> responsePage = logPage.map(activityLogMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<ActivityLog> logPage = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<ActivityLogResponse> responsePage = logPage.map(activityLogMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getRecent() {
        List<ActivityLog> logs = activityLogRepository.findTop50ByOrderByCreatedAtDesc();
        return activityLogMapper.toResponseList(logs);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getByTargetUserId(Long targetUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<ActivityLog> logPage = activityLogRepository.findByTargetUserIdOrderByCreatedAtDesc(targetUserId, pageable);
        Page<ActivityLogResponse> responsePage = logPage.map(activityLogMapper::toResponse);
        return PageResponse.from(responsePage);
    }
}
