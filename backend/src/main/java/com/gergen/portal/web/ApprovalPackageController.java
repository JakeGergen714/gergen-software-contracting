package com.gergen.portal.web;

import com.gergen.portal.model.*;
import com.gergen.portal.repo.*;
import com.gergen.portal.security.AccessService;
import com.gergen.portal.service.MailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/approval-packages")
public class ApprovalPackageController {
    private final ApprovalPackageRepository pkgRepo;
    private final ApprovalPackageItemRepository itemRepo;
    private final AccessService accessService;
    private final MailService mailService;

    public ApprovalPackageController(ApprovalPackageRepository pkgRepo,
                                     ApprovalPackageItemRepository itemRepo,
                                     AccessService accessService,
                                     MailService mailService) {
        this.pkgRepo = pkgRepo;
        this.itemRepo = itemRepo;
        this.accessService = accessService;
        this.mailService = mailService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@PathVariable UUID projectId, @RequestBody Map<String, Object> body, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var name = body.getOrDefault("name", "Release").toString();
        var pkg = new ApprovalPackage();
        pkg.setProjectId(projectId);
        pkg.setName(name);
        pkg.setState(PackageState.DRAFT);
        pkg.setReleaseNotes((String) body.getOrDefault("release_notes", null));
        pkg.setEnvLinks((String) body.getOrDefault("env_links", "[]"));
        pkg.setTestCreds((String) body.getOrDefault("test_creds", "{}"));
        pkg = pkgRepo.save(pkg);
        return ResponseEntity.ok(Map.of("id", pkg.getId(), "name", pkg.getName()));
    }

    @PatchMapping("/{pkgId}")
    public ResponseEntity<Void> update(@PathVariable UUID projectId, @PathVariable UUID pkgId, @RequestBody Map<String, Object> body, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var pkg = pkgRepo.findById(pkgId).orElseThrow();
        if (body.containsKey("release_notes")) pkg.setReleaseNotes((String) body.get("release_notes"));
        if (body.containsKey("env_links")) pkg.setEnvLinks((String) body.get("env_links"));
        if (body.containsKey("test_creds")) pkg.setTestCreds((String) body.get("test_creds"));
        pkgRepo.save(pkg);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{pkgId}/items")
    public ResponseEntity<Void> addItems(@PathVariable UUID projectId, @PathVariable UUID pkgId, @RequestBody Map<String, Object> body, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items == null) return ResponseEntity.badRequest().build();
        for (var m : items) {
            var item = new ApprovalPackageItem();
            item.setPackageId(pkgId);
            item.setBacklogItemId(UUID.fromString(m.get("backlog_item_id").toString()));
            item.setTestSteps((String) m.getOrDefault("test_steps", ""));
            item.setDeepLink((String) m.getOrDefault("deep_link", null));
            itemRepo.save(item);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{pkgId}/send")
    public ResponseEntity<Void> send(@PathVariable UUID projectId, @PathVariable UUID pkgId, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var pkg = pkgRepo.findById(pkgId).orElseThrow();
        pkg.setState(PackageState.SENT);
        pkg.setSentAt(OffsetDateTime.now());
        pkgRepo.save(pkg);
        // MVP: send a single demo email if configured
        mailService.send("client@example.com", "New features ready to try", pkg.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{pkgId}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable UUID projectId, @PathVariable UUID pkgId, Authentication auth) {
        if (!accessService.isMember(auth, projectId)) return ResponseEntity.status(403).build();
        var pkg = pkgRepo.findById(pkgId).orElseThrow();
        pkg.setState(PackageState.RESOLVED);
        pkg.setClosedAt(OffsetDateTime.now());
        pkgRepo.save(pkg);
        return ResponseEntity.noContent().build();
    }
}
