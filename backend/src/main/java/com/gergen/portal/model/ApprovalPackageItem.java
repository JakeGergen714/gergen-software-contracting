package com.gergen.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "approval_package_items")
@Getter
@Setter
public class ApprovalPackageItem {
    @Id @GeneratedValue
    private UUID id;

    @Column(name = "package_id")
    private UUID packageId;

    @Column(name = "backlog_item_id")
    private UUID backlogItemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "client_status", columnDefinition = "client_status")
    private ClientStatus clientStatus = ClientStatus.UNSET;

    @Column(name = "client_comment")
    private String clientComment;

    @Column(name = "client_attachments", columnDefinition = "jsonb")
    private String clientAttachments;

    @Column(name = "test_steps")
    private String testSteps;

    @Column(name = "deep_link")
    private String deepLink;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
