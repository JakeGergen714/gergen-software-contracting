package com.gergen.portal.api.dto;

import com.gergen.portal.domain.StoryStage;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StoryDto {
    private UUID id;
    private UUID epicId;
    private UUID projectId;
    private String title;
    private String description;
    private List<String> acceptanceCriteria = new ArrayList<>();
    private StoryStage stage;
    private UUID sprintId;
    private Integer points;
    private Integer planningOrder;

    public StoryDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEpicId() {
        return epicId;
    }

    public void setEpicId(UUID epicId) {
        this.epicId = epicId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria != null ? acceptanceCriteria : new ArrayList<>();
    }

    public StoryStage getStage() {
        return stage;
    }

    public void setStage(StoryStage stage) {
        this.stage = stage;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getPlanningOrder() {
        return planningOrder;
    }

    public void setPlanningOrder(Integer planningOrder) {
        this.planningOrder = planningOrder;
    }
}