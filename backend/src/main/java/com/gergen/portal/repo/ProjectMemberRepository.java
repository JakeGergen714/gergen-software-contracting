package com.gergen.portal.repo;

import com.gergen.portal.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    List<ProjectMember> findByUserId(String userId);
    List<ProjectMember> findByProjectIdAndUserId(UUID projectId, String userId);
}
