package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "client_requests")
@Getter
@Setter
public class ClientRequest {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String type; // problem | feature | question

    @Column(nullable = false)
    private String subject;

    private String details;

    @Column(nullable = false)
    private String status = "received"; // received | in-progress | done

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
