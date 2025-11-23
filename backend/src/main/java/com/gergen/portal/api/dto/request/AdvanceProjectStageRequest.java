package com.gergen.portal.api.dto.request;

import com.gergen.portal.domain.ProjectStage;
import jakarta.validation.constraints.NotNull;

public class AdvanceProjectStageRequest {
    @NotNull
    private ProjectStage stage;

    public ProjectStage getStage() {
        return stage;
    }

    public void setStage(ProjectStage stage) {
        this.stage = stage;
    }
}