package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project {
    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "project_stage")
    private ProjectStage stage = ProjectStage.DRAFT;

    @Column(name = "next_milestone_at")
    private OffsetDateTime nextMilestoneAt;

    @Column(name = "last_deployment_at")
    private OffsetDateTime lastDeploymentAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
