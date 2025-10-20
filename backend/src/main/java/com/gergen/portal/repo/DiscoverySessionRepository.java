package com.gergen.portal.repo;

import com.gergen.portal.model.DiscoverySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiscoverySessionRepository extends JpaRepository<DiscoverySession, UUID> {
    List<DiscoverySession> findByProjectIdOrderByScheduledAtDesc(UUID projectId);
}
