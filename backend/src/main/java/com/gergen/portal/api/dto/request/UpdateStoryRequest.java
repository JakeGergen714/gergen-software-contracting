package com.gergen.portal.api.dto.request;

import com.gergen.portal.domain.StoryStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UpdateStoryRequest {
    @NotNull
    private UUID epicId;

    @NotBlank
    private String title;

    private String description;

    @NotEmpty
    private List<String> acceptanceCriteria = new ArrayList<>();

    private Integer points;
    private UUID sprintId;

    @NotNull
    private StoryStage stage;

    private Integer planningOrder;

    public UUID getEpicId() {
        return epicId;
    }

    public void setEpicId(UUID epicId) {
        this.epicId = epicId;
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
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public StoryStage getStage() {
        return stage;
    }

    public void setStage(StoryStage stage) {
        this.stage = stage;
    }

    public Integer getPlanningOrder() {
        return planningOrder;
    }

    public void setPlanningOrder(Integer planningOrder) {
        this.planningOrder = planningOrder;
    }
}