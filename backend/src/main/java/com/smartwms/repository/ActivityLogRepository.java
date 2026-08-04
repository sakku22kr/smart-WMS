package com.smartwms.repository;

import com.smartwms.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for {@link ActivityLog} entities.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** Paginated list of all activity logs, ordered by newest first. */
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Activity logs for a specific user (as actor or target). */
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Activity logs where the user is the target. */
    Page<ActivityLog> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId, Pageable pageable);

    /** Recent activity logs (limit 50). */
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();

    /** Activity logs related to a specific supplier (metadata contains supplier ID). */
    @Query(value = "SELECT * FROM activity_logs WHERE metadata LIKE CONCAT('%', :supplierId, '%') ORDER BY created_at DESC", nativeQuery = true)
    List<ActivityLog> findBySupplierId(@Param("supplierId") Long supplierId);

    /** Paginated activity logs related to a specific supplier. */
    @Query(value = "SELECT * FROM activity_logs WHERE metadata LIKE CONCAT('%', :supplierId, '%') ORDER BY created_at DESC", countQuery = "SELECT COUNT(*) FROM activity_logs WHERE metadata LIKE CONCAT('%', :supplierId, '%')", nativeQuery = true)
    Page<ActivityLog> findBySupplierId(@Param("supplierId") Long supplierId, Pageable pageable);
}
