package com.gergen.portal.api;

import com.gergen.portal.api.dto.ProjectDetailDto;
import com.gergen.portal.api.dto.request.AdvanceProjectStageRequest;
import com.gergen.portal.api.dto.request.CreateEpicRequest;
import com.gergen.portal.api.dto.request.CreateSprintRequest;
import com.gergen.portal.api.dto.request.CreateStoryRequest;
import com.gergen.portal.api.dto.request.EndSprintRequest;
import com.gergen.portal.api.dto.request.ScheduleMeetingRequest;
import com.gergen.portal.api.dto.request.UpdateEpicRequest;
import com.gergen.portal.api.dto.request.UpdateEpicStatusRequest;
import com.gergen.portal.api.dto.request.UpdateStatusNoteRequest;
import com.gergen.portal.api.dto.request.UpdateStoryRequest;
import com.gergen.portal.api.dto.request.UpdateStoryStageRequest;
import com.gergen.portal.service.PortalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@Validated
public class ProjectController {
    private final PortalService portalService;

    public ProjectController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/{projectId}")
    public ProjectDetailDto getProject(@PathVariable("projectId") UUID projectId) {
        return portalService.getProject(projectId);
    }

    @PostMapping("/{projectId}/meetings")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailDto scheduleMeeting(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody ScheduleMeetingRequest request) {
        return portalService.scheduleMeeting(projectId, request);
    }

    @PutMapping("/{projectId}/stage")
    public ProjectDetailDto advanceStage(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody AdvanceProjectStageRequest request) {
        return portalService.advanceProjectStage(projectId, request);
    }

    @PostMapping("/{projectId}/epics")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailDto createEpic(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateEpicRequest request) {
        return portalService.createEpic(projectId, request);
    }

    @PatchMapping("/{projectId}/epics/{epicId}")
    public ProjectDetailDto updateEpic(@PathVariable("projectId") UUID projectId,
            @PathVariable("epicId") UUID epicId,
            @RequestBody UpdateEpicRequest request) {
        return portalService.updateEpic(projectId, epicId, request);
    }

    @PostMapping("/{projectId}/epics/{epicId}/status")
    public ProjectDetailDto updateEpicStatus(@PathVariable("projectId") UUID projectId,
            @PathVariable("epicId") UUID epicId,
            @Valid @RequestBody UpdateEpicStatusRequest request) {
        return portalService.updateEpicStatus(projectId, epicId, request);
    }

    @DeleteMapping("/{projectId}/epics/{epicId}")
    public ProjectDetailDto deleteEpic(@PathVariable("projectId") UUID projectId,
            @PathVariable("epicId") UUID epicId) {
        return portalService.deleteEpic(projectId, epicId);
    }

    @PostMapping("/{projectId}/stories")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailDto createStory(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateStoryRequest request) {
        return portalService.createStory(projectId, request);
    }

    @PatchMapping("/{projectId}/stories/{storyId}")
    public ProjectDetailDto updateStory(@PathVariable("projectId") UUID projectId,
            @PathVariable("storyId") UUID storyId,
            @Valid @RequestBody UpdateStoryRequest request) {
        return portalService.updateStory(projectId, storyId, request);
    }

    @PostMapping("/{projectId}/stories/{storyId}/stage")
    public ProjectDetailDto updateStoryStage(@PathVariable("projectId") UUID projectId,
            @PathVariable("storyId") UUID storyId,
            @Valid @RequestBody UpdateStoryStageRequest request) {
        return portalService.updateStoryStage(projectId, storyId, request);
    }

    @DeleteMapping("/{projectId}/stories/{storyId}")
    public ProjectDetailDto deleteStory(@PathVariable("projectId") UUID projectId,
            @PathVariable("storyId") UUID storyId) {
        return portalService.deleteStory(projectId, storyId);
    }

    @PostMapping("/{projectId}/sprints")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailDto createSprint(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateSprintRequest request) {
        return portalService.createSprint(projectId, request);
    }

    @PostMapping("/{projectId}/sprints/{sprintId}/start")
    public ProjectDetailDto startSprint(@PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId) {
        return portalService.startSprint(projectId, sprintId);
    }

    @PostMapping("/{projectId}/sprints/{sprintId}/end")
    public ProjectDetailDto endSprint(@PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId,
            @RequestBody(required = false) EndSprintRequest request) {
        EndSprintRequest payload = request != null ? request : new EndSprintRequest();
        return portalService.endSprint(projectId, sprintId, payload);
    }

    @DeleteMapping("/{projectId}/sprints/{sprintId}")
    public ProjectDetailDto deleteSprint(@PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId) {
        return portalService.deleteSprint(projectId, sprintId);
    }

    @PatchMapping("/{projectId}/status-note")
    public ProjectDetailDto updateStatusNote(@PathVariable("projectId") UUID projectId,
            @Valid @RequestBody UpdateStatusNoteRequest request) {
        return portalService.updateStatusNote(projectId, request);
    }
}