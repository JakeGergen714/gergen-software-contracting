package com.gergen.portal.web;

import com.gergen.portal.model.DiscoverySession;
import com.gergen.portal.model.DiscoveryStage;
import com.gergen.portal.repo.DiscoverySessionRepository;
import com.gergen.portal.security.AccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/discovery")
public class DiscoveryController {
    private final DiscoverySessionRepository repo;
    private final AccessService accessService;

    public DiscoveryController(DiscoverySessionRepository repo, AccessService accessService) {
        this.repo = repo;
        this.accessService = accessService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@PathVariable UUID projectId, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var list = repo.findByProjectIdOrderByScheduledAtDesc(projectId).stream().map(ds -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ds.getId());
            m.put("title", ds.getTitle());
            m.put("stage", ds.getStage().name());
            m.put("scheduled_at", ds.getScheduledAt());
            m.put("duration_minutes", ds.getDurationMinutes());
            m.put("agenda_items", ds.getAgendaItems());
            m.put("notes", ds.getNotes());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@PathVariable UUID projectId, @RequestBody Map<String, Object> body, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var ds = new DiscoverySession();
        ds.setProjectId(projectId);
        ds.setTitle(body.getOrDefault("title", "Discovery").toString());
        if (body.get("stage") != null) ds.setStage(DiscoveryStage.valueOf(body.get("stage").toString()));
        if (body.get("scheduled_at") != null) ds.setScheduledAt(OffsetDateTime.parse(body.get("scheduled_at").toString()));
        if (body.get("duration_minutes") != null) ds.setDurationMinutes(Integer.parseInt(body.get("duration_minutes").toString()));
        ds.setAgendaItems((String) body.getOrDefault("agenda_items", "[]"));
        ds.setNotes((String) body.getOrDefault("notes", null));
        ds = repo.save(ds);
        return ResponseEntity.ok(Map.of("id", ds.getId(), "title", ds.getTitle()));
    }
}
