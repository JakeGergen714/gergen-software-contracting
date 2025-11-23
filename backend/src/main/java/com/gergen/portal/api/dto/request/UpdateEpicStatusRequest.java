package com.gergen.portal.api.dto.request;

import com.gergen.portal.domain.EpicStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateEpicStatusRequest {
    @NotNull
    private EpicStatus status;

    public EpicStatus getStatus() {
        return status;
    }

    public void setStatus(EpicStatus status) {
        this.status = status;
    }
}