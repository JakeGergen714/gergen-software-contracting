package com.gergen.clientportal.testsupport;

import com.gergen.portal.api.dto.ProjectDetailDto;
import com.gergen.portal.service.PortalService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Minimal service for test data seeding.
 *
 * NOTE: This class should be wired to real repositories/services when available.
 */
@Service
public class TestDataService {

    private final PortalService portalService;

    public TestDataService(PortalService portalService) {
        this.portalService = portalService;
    }

    public void reset() {
        // TODO: if you introduce a test tenant or marker, delete only those projects.
        // For now this is a no-op to avoid accidentally deleting real data.
    }

    public Map<String, Object> createAdminSampleProject(Map<String, Object> payload) {
        Map<String, Object> result = new HashMap<>();

        String name = payload != null && payload.containsKey("name")
            ? payload.get("name").toString()
            : "E2E Sample Project";

        // For now, reuse an existing project if payload provides an ID; otherwise
        // just echo back a synthetic ID. When you introduce a "createProject" API
        // on PortalService, this is the place to call it.
        if (payload != null && payload.containsKey("projectId")) {
            UUID projectId = UUID.fromString(payload.get("projectId").toString());
            ProjectDetailDto dto = portalService.getProject(projectId);
            result.put("projectId", dto.getId());
            result.put("name", dto.getName());
        } else {
            result.put("projectId", UUID.randomUUID());
            result.put("name", name);
        }

        return result;
    }
}
