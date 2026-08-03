package com.smartwms.entity;

import com.smartwms.constants.ActivityType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks user and system activities for audit purposes.
 *
 * <p>This entity is append-only and never soft-deleted.</p>
 */
@Entity
@Table(
    name = "activity_logs",
    indexes = {
        @Index(name = "idx_activity_user_id", columnList = "user_id"),
        @Index(name = "idx_activity_type", columnList = "activity_type"),
        @Index(name = "idx_activity_created_at", columnList = "created_at"),
        @Index(name = "idx_activity_actor", columnList = "actor_email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 50)
    private ActivityType activityType;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "actor_email", nullable = false, length = 150)
    private String actorEmail;

    @Column(name = "actor_name", length = 200)
    private String actorName;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "target_user_name", length = 200)
    private String targetUserName;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "metadata", length = 2000)
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
