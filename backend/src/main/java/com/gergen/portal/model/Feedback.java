package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback")
@Getter
@Setter
public class Feedback {
    @Id @GeneratedValue
    private UUID id;
    @Column(name = "project_id")
    private UUID projectId;
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", columnDefinition = "feedback_source")
    private FeedbackSource sourceType;
    @Column(name = "source_id")
    private UUID sourceId;
    @Column(name = "author_user_id")
    private String authorUserId;
    private String text;
    @Column(name = "attachments", columnDefinition = "jsonb")
    private String attachments;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "feedback_status")
    private FeedbackStatus status = FeedbackStatus.OPEN;
    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
