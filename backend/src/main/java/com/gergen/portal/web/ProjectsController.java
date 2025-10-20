package com.gergen.portal.web;

import com.gergen.portal.model.*;
import com.gergen.portal.repo.*;
import com.gergen.portal.security.AccessService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectsController {

    private final ProjectRepository projectRepository;
    private final BacklogItemRepository backlogItemRepository;
    private final ApprovalPackageRepository approvalPackageRepository;
    private final ApprovalPackageItemRepository approvalPackageItemRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AccessService accessService;

    public ProjectsController(ProjectRepository projectRepository,
                              BacklogItemRepository backlogItemRepository,
                              ApprovalPackageRepository approvalPackageRepository,
                              ApprovalPackageItemRepository approvalPackageItemRepository,
                              ProjectMemberRepository projectMemberRepository,
                              AccessService accessService) {
        this.projectRepository = projectRepository;
        this.backlogItemRepository = backlogItemRepository;
        this.approvalPackageRepository = approvalPackageRepository;
        this.approvalPackageItemRepository = approvalPackageItemRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.accessService = accessService;
    }

    @GetMapping
    public List<Map<String, Object>> list(Authentication auth) {
        // Admins can view all projects
        if (accessService.isAdmin(auth)) {
            return projectRepository.findAll().stream().map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", p.getId());
                m.put("title", p.getTitle());
                m.put("stage", p.getStage().name());
                return m;
            }).collect(Collectors.toList());
        }
        String email = auth != null && auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt ? jwt.getClaimAsString("email") : null;
        var projects = email == null ? projectRepository.findAll() : projectMemberRepository.findByUserId(email).stream().map(pm -> pm.getProjectId()).distinct().map(pid -> projectRepository.findById(pid).orElse(null)).filter(Objects::nonNull).toList();
        return projects.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("title", p.getTitle());
            m.put("stage", p.getStage().name());
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> overview(@PathVariable("id") UUID id, Authentication auth) {
        if (!accessService.isMember(auth, id)) return ResponseEntity.status(403).build();
        var p = projectRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();
        var items = backlogItemRepository.findByProjectId(id);
        long done = items.stream().filter(i -> i.getStatus() == BacklogStatus.DONE).count();
        long total = items.size();
        double progress = total == 0 ? 0 : (double) done / (double) total;
        var activity = List.of(); // TODO: add activity repo and return last 5
    Map<String, Object> resp = new LinkedHashMap<>();
    resp.put("id", p.getId());
    resp.put("title", p.getTitle());
    resp.put("stage", p.getStage().name());
    resp.put("next_milestone_at", p.getNextMilestoneAt());
    resp.put("last_deployment_at", p.getLastDeploymentAt());
    resp.put("progress", progress);
    resp.put("activity", activity);
    return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}/backlog")
    public List<Map<String, Object>> backlog(@PathVariable("id") UUID id, Authentication auth) {
        if (!accessService.isMember(auth, id)) return List.of();
        return backlogItemRepository.findByProjectId(id).stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", i.getId());
            m.put("title", i.getTitle());
            m.put("status", i.getStatus().name());
            m.put("priority", i.getPriority());
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}/approval-packages/current")
    public ResponseEntity<Map<String, Object>> currentPackage(@PathVariable("id") UUID id, Authentication auth) {
        if (!accessService.isMember(auth, id)) return ResponseEntity.status(403).build();
        var states = List.of(PackageState.SENT, PackageState.RESPONDED);
        return approvalPackageRepository.findFirstByProjectIdAndStateInOrderByCreatedAtDesc(id, states)
            .map(pkg -> {
                var items = approvalPackageItemRepository.findByPackageId(pkg.getId()).stream().map(pi -> {
                    Map<String, Object> mi = new LinkedHashMap<>();
                    mi.put("id", pi.getId());
                    mi.put("backlog_item_id", pi.getBacklogItemId());
                    mi.put("client_status", pi.getClientStatus().name());
                    mi.put("test_steps", pi.getTestSteps());
                    mi.put("deep_link", pi.getDeepLink());
                    return mi;
                }).collect(Collectors.toList());
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", pkg.getId());
                m.put("name", pkg.getName());
                m.put("state", pkg.getState().name());
                m.put("release_notes", pkg.getReleaseNotes());
                m.put("env_links", pkg.getEnvLinks());
                m.put("items", items);
                return ResponseEntity.ok(m);
            })
            .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/backlog/lock")
    public ResponseEntity<Void> lockBacklog(@PathVariable("id") UUID id, Authentication auth) {
        // MVP: allow any member; tighten to ADMIN with @PreAuthorize later
        if (!accessService.isMember(auth, id)) return ResponseEntity.status(403).build();
        var items = backlogItemRepository.findByProjectId(id);
        items.forEach(i -> { i.setLocked(true); });
        backlogItemRepository.saveAll(items);
        return ResponseEntity.noContent().build();
    }
}
