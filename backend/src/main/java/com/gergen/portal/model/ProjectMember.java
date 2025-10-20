package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_members")
@Getter
@Setter
public class ProjectMember {
    @Id @GeneratedValue
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "user_id")
    private String userId; // Keycloak user identifier (email for MVP)

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "member_role")
    private MemberRole role;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
