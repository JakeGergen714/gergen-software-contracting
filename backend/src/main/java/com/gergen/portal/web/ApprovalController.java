package com.gergen.portal.web;

import com.gergen.portal.model.ApprovalPackageItem;
import com.gergen.portal.model.ClientStatus;
import com.gergen.portal.repo.ApprovalPackageItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/approval-packages/{pkgId}")
public class ApprovalController {
    private final ApprovalPackageItemRepository itemRepository;
    public ApprovalController(ApprovalPackageItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @PostMapping("/respond")
    public ResponseEntity<Void> respond(@PathVariable UUID projectId, @PathVariable UUID pkgId, @RequestBody Map<String, Object> body) {
        // Expected body: { responses: [{itemId, status: 'APPROVED'|'NEEDS_CHANGES', comment?: string}] }
        List<Map<String, Object>> responses = (List<Map<String, Object>>) body.get("responses");
        if (responses == null) return ResponseEntity.badRequest().build();
        for (var r : responses) {
            UUID itemId = UUID.fromString(r.get("itemId").toString());
            String status = r.get("status").toString();
            String comment = r.get("comment") != null ? r.get("comment").toString() : null;
            ApprovalPackageItem item = itemRepository.findById(itemId).orElseThrow();
            item.setClientStatus(ClientStatus.valueOf(status));
            item.setClientComment(comment);
            itemRepository.save(item);
        }
        return ResponseEntity.noContent().build();
    }
}
