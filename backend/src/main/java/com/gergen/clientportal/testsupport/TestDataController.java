package com.gergen.clientportal.testsupport;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Test-only endpoints used by Playwright to seed and reset data.
 */
@RestController
@RequestMapping("/api/test")
@Profile("test")
public class TestDataController {

    private final TestDataService testDataService;

    public TestDataController(TestDataService testDataService) {
        this.testDataService = testDataService;
    }

    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<Void> reset() {
        testDataService.reset();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin-sample-project")
    @Transactional
    public ResponseEntity<Map<String, Object>> createAdminSampleProject(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> result = testDataService.createAdminSampleProject(payload);
        return ResponseEntity.ok(result);
    }
}
