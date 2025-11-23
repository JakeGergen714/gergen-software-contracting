package com.gergen.portal.api.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectDetailDto extends ProjectSummaryDto {
    private List<EpicDto> epics = new ArrayList<>();
    private List<StoryDto> stories = new ArrayList<>();
    private List<SprintDto> sprints = new ArrayList<>();
    private List<MeetingDto> meetings = new ArrayList<>();

    public ProjectDetailDto() {
        super();
    }

    public ProjectDetailDto(ProjectSummaryDto summary) {
        super(summary.getId(), summary.getBusinessId(), summary.getName(), summary.getDescription(),
                summary.getStage(), summary.getApprovalState(), summary.getKickoffCallAt(),
                summary.getUpdatedAt(), summary.getStatusNote());
    }

    public List<EpicDto> getEpics() {
        return epics;
    }

    public void setEpics(List<EpicDto> epics) {
        this.epics = epics != null ? epics : new ArrayList<>();
    }

    public List<StoryDto> getStories() {
        return stories;
    }

    public void setStories(List<StoryDto> stories) {
        this.stories = stories != null ? stories : new ArrayList<>();
    }

    public List<SprintDto> getSprints() {
        return sprints;
    }

    public void setSprints(List<SprintDto> sprints) {
        this.sprints = sprints != null ? sprints : new ArrayList<>();
    }

    public List<MeetingDto> getMeetings() {
        return meetings;
    }

    public void setMeetings(List<MeetingDto> meetings) {
        this.meetings = meetings != null ? meetings : new ArrayList<>();
    }

}