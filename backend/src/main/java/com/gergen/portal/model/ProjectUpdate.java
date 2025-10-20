package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_updates")
@Getter
@Setter
public class ProjectUpdate {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String kind; // maintenance | release | note

    @Column(nullable = false)
    private String title;

    private String summary;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
