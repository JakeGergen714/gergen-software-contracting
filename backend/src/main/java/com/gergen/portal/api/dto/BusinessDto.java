package com.gergen.portal.api.dto;

import java.time.Instant;
import java.util.UUID;

public class BusinessDto {
    private UUID id;
    private String name;
    private UUID primaryContactUserId;
    private Instant createdAt;

    public BusinessDto() {
    }

    public BusinessDto(UUID id, String name, UUID primaryContactUserId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.primaryContactUserId = primaryContactUserId;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getPrimaryContactUserId() {
        return primaryContactUserId;
    }

    public void setPrimaryContactUserId(UUID primaryContactUserId) {
        this.primaryContactUserId = primaryContactUserId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}