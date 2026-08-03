package com.smartwms.mapper;

import com.smartwms.dto.response.ActivityLogResponse;
import com.smartwms.entity.ActivityLog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for {@link ActivityLog} ↔ DTO conversions.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ActivityLogMapper {

    ActivityLogResponse toResponse(ActivityLog log);

    List<ActivityLogResponse> toResponseList(List<ActivityLog> logs);
}
