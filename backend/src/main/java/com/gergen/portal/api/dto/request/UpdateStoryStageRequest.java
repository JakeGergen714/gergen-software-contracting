package com.gergen.portal.api.dto.request;

import com.gergen.portal.domain.StoryStage;
import jakarta.validation.constraints.NotNull;

public class UpdateStoryStageRequest {
    @NotNull
    private StoryStage stage;

    public StoryStage getStage() {
        return stage;
    }

    public void setStage(StoryStage stage) {
        this.stage = stage;
    }
}