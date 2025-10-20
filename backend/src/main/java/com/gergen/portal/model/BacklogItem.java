package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "backlog_items")
@Getter
@Setter
public class BacklogItem {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    private String title;
    private String description;

    @Column(name = "acceptance_criteria", columnDefinition = "jsonb")
    private String acceptanceCriteria; // store as JSON string for simplicity

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "backlog_status")
    private BacklogStatus status = BacklogStatus.PLANNED;

    private int priority = 100;

    @Column(name = "owner_user_id")
    private String ownerUserId;

    @Column(name = "is_locked")
    private boolean isLocked = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_request_status", columnDefinition = "change_request_status")
    private ChangeRequestStatus changeRequestStatus = ChangeRequestStatus.NONE;

    @Column(name = "change_request_reason")
    private String changeRequestReason;

    @Column(name = "links", columnDefinition = "jsonb")
    private String links; // json string

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
