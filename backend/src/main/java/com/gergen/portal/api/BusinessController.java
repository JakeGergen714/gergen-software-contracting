package com.gergen.portal.api;

import com.gergen.portal.api.dto.BusinessOverviewDto;
import com.gergen.portal.api.dto.ProjectDetailDto;
import com.gergen.portal.api.dto.ProjectSummaryDto;
import com.gergen.portal.api.dto.request.CreateProjectRequest;
import com.gergen.portal.service.PortalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
@Validated
public class BusinessController {
    private final PortalService portalService;

    public BusinessController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/{businessId}/overview")
    public BusinessOverviewDto getOverview(@PathVariable("businessId") UUID businessId) {
        return portalService.getBusinessOverview(businessId);
    }

    @GetMapping("/{businessId}/projects")
    public List<ProjectSummaryDto> listProjects(@PathVariable("businessId") UUID businessId) {
        return portalService.listProjects(businessId);
    }

    @PostMapping("/{businessId}/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailDto createProject(@PathVariable("businessId") UUID businessId,
            @Valid @RequestBody CreateProjectRequest request) {
        return portalService.createProject(businessId, request);
    }
}