package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity")
@Getter
@Setter
public class Activity {
    @Id @GeneratedValue
    private UUID id;
    @Column(name = "project_id")
    private UUID projectId;
    @Column(name = "actor_user_id")
    private String actorUserId;
    private String action;
    @Column(name = "details", columnDefinition = "jsonb")
    private String details;
    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
