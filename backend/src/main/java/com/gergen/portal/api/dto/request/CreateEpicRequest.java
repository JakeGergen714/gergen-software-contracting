package com.gergen.portal.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.List;

public class CreateEpicRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotBlank
    private String color;

    @NotEmpty
    private List<String> acceptanceCriteria = new ArrayList<>();

    private String clientSummary;

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

    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public String getClientSummary() {
        return clientSummary;
    }

    public void setClientSummary(String clientSummary) {
        this.clientSummary = clientSummary;
    }
}