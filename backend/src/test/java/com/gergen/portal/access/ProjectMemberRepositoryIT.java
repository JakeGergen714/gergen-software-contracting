package com.gergen.portal.access;

import com.gergen.portal.BaseIntegrationTest;
import com.gergen.portal.model.ProjectMember;
import com.gergen.portal.repo.ProjectMemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectMemberRepositoryIT extends BaseIntegrationTest {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Test
    void findByProjectIdAndUserId_returnsPersistedMember() {
        UUID projectId = UUID.randomUUID();
        String userId = "user-123";

        ProjectMember member = new ProjectMember(
                UUID.randomUUID(),
                projectId,
                userId,
                "OWNER");
        projectMemberRepository.save(member);

        List<ProjectMember> result = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getRole()).isEqualTo("OWNER");
    }
}
