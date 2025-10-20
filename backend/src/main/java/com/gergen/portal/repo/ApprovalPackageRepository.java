package com.gergen.portal.repo;

import com.gergen.portal.model.ApprovalPackage;
import com.gergen.portal.model.PackageState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ApprovalPackageRepository extends JpaRepository<ApprovalPackage, UUID> {
    Optional<ApprovalPackage> findFirstByProjectIdAndStateInOrderByCreatedAtDesc(UUID projectId, Iterable<PackageState> states);
}
