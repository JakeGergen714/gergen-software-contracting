package com.gergen.portal.repo;

import com.gergen.portal.model.ApprovalPackageItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApprovalPackageItemRepository extends JpaRepository<ApprovalPackageItem, UUID> {
    List<ApprovalPackageItem> findByPackageId(UUID packageId);
}
