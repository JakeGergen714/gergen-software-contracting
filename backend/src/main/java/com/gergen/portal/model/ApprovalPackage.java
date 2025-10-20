package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "approval_packages")
@Getter
@Setter
public class ApprovalPackage {
    @Id @GeneratedValue
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", columnDefinition = "pkg_state")
    private PackageState state = PackageState.DRAFT;

    @Column(name = "release_notes")
    private String releaseNotes;

    @Column(name = "env_links", columnDefinition = "jsonb")
    private String envLinks;

    @Column(name = "test_creds", columnDefinition = "jsonb")
    private String testCreds;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
