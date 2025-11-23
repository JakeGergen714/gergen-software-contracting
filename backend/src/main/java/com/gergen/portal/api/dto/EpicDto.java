package com.gergen.portal.api.dto;

import com.gergen.portal.domain.EpicStatus;
import com.gergen.portal.domain.EpicType;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EpicDto {
    private UUID id;
    private UUID projectId;
    private String name;
    private String description;
    private String color;
    private EpicStatus status;
    private EpicType type = EpicType.FEATURE;
    private List<String> acceptanceCriteria = new ArrayList<>();
    private String clientSummary;
    private DefectDetailsDto defectDetails;

    public EpicDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public EpicStatus getStatus() {
        return status;
    }

    public void setStatus(EpicStatus status) {
        this.status = status;
    }

    public EpicType getType() {
        return type;
    }

    public void setType(EpicType type) {
        this.type = type;
    }

    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria != null ? acceptanceCriteria : new ArrayList<>();
    }

    public String getClientSummary() {
        return clientSummary;
    }

    public void setClientSummary(String clientSummary) {
        this.clientSummary = clientSummary;
    }

    public DefectDetailsDto getDefectDetails() {
        return defectDetails;
    }

    public void setDefectDetails(DefectDetailsDto defectDetails) {
        this.defectDetails = defectDetails;
    }
}
