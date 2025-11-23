package com.gergen.portal.api.dto;

import com.gergen.portal.domain.ProjectApprovalState;
import com.gergen.portal.domain.ProjectStage;

import java.time.Instant;
import java.util.UUID;

public class ProjectSummaryDto {
    private UUID id;
    private UUID businessId;
    private String name;
    private String description;
    private ProjectStage stage;
    private ProjectApprovalState approvalState;
    private Instant kickoffCallAt;
    private Instant updatedAt;
    private String statusNote;

    public ProjectSummaryDto() {
    }

    public ProjectSummaryDto(UUID id, UUID businessId, String name, String description,
            ProjectStage stage, ProjectApprovalState approvalState,
            Instant kickoffCallAt, Instant updatedAt, String statusNote) {
        this.id = id;
        this.businessId = businessId;
        this.name = name;
        this.description = description;
        this.stage = stage;
        this.approvalState = approvalState;
        this.kickoffCallAt = kickoffCallAt;
        this.updatedAt = updatedAt;
        this.statusNote = statusNote;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBusinessId() {
        return businessId;
    }

    public void setBusinessId(UUID businessId) {
        this.businessId = businessId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStage getStage() {
        return stage;
    }

    public void setStage(ProjectStage stage) {
        this.stage = stage;
    }

    public ProjectApprovalState getApprovalState() {
        return approvalState;
    }

    public void setApprovalState(ProjectApprovalState approvalState) {
        this.approvalState = approvalState;
    }

    public Instant getKickoffCallAt() {
        return kickoffCallAt;
    }

    public void setKickoffCallAt(Instant kickoffCallAt) {
        this.kickoffCallAt = kickoffCallAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatusNote() {
        return statusNote;
    }

    public void setStatusNote(String statusNote) {
        this.statusNote = statusNote;
    }
}