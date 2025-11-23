package com.gergen.portal.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class CreateProjectRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    private Instant kickoffCallAt;

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

    public Instant getKickoffCallAt() {
        return kickoffCallAt;
    }

    public void setKickoffCallAt(Instant kickoffCallAt) {
        this.kickoffCallAt = kickoffCallAt;
    }
}