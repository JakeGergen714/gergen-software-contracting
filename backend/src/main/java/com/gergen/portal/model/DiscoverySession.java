package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "discovery_sessions")
@Getter
@Setter
public class DiscoverySession {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", columnDefinition = "discovery_stage")
    private DiscoveryStage stage = DiscoveryStage.INTAKE;

    @Column(name = "scheduled_at")
    private OffsetDateTime scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "agenda_items", columnDefinition = "jsonb")
    private String agendaItems; // JSON array of strings

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
