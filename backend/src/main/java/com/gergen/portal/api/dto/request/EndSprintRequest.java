package com.gergen.portal.api.dto.request;

public class EndSprintRequest {
    private boolean moveUnfinishedToNextSprint;

    public boolean isMoveUnfinishedToNextSprint() {
        return moveUnfinishedToNextSprint;
    }

    public void setMoveUnfinishedToNextSprint(boolean moveUnfinishedToNextSprint) {
        this.moveUnfinishedToNextSprint = moveUnfinishedToNextSprint;
    }
}