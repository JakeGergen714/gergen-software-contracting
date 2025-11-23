package com.gergen.portal.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusNoteRequest {
    @NotBlank
    private String statusNote;

    public String getStatusNote() {
        return statusNote;
    }

    public void setStatusNote(String statusNote) {
        this.statusNote = statusNote;
    }
}