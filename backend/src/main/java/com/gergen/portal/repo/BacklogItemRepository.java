package com.gergen.portal.repo;

import com.gergen.portal.model.BacklogItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BacklogItemRepository extends JpaRepository<BacklogItem, UUID> {
    List<BacklogItem> findByProjectId(UUID projectId);
}
