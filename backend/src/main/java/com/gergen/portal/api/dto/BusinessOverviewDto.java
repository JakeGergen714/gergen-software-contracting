package com.gergen.portal.api.dto;

import java.util.ArrayList;
import java.util.List;

public class BusinessOverviewDto {
    private BusinessDto business;
    private List<ProjectSummaryDto> projects = new ArrayList<>();

    public BusinessOverviewDto() {
    }

    public BusinessOverviewDto(BusinessDto business, List<ProjectSummaryDto> projects) {
        this.business = business;
        this.projects = projects != null ? projects : new ArrayList<>();
    }

    public BusinessDto getBusiness() {
        return business;
    }

    public void setBusiness(BusinessDto business) {
        this.business = business;
    }

    public List<ProjectSummaryDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectSummaryDto> projects) {
        this.projects = projects != null ? projects : new ArrayList<>();
    }
}