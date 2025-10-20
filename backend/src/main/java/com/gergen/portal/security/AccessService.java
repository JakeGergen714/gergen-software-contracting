package com.gergen.portal.security;

import com.gergen.portal.repo.ProjectMemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AccessService {
    private final ProjectMemberRepository memberRepository;
    @Value("${app.security.disable:false}")
    private boolean securityDisabled;

    public AccessService(ProjectMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public boolean isMember(Authentication auth, UUID projectId) {
        if (securityDisabled) return true;
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) return false;
        // Admins can access everything
        if (isAdmin(auth)) return true;
        String userId = jwt.getClaimAsString("email"); // MVP: email as identifier
        return !memberRepository.findByProjectIdAndUserId(projectId, userId).isEmpty();
    }

    public boolean isAdmin(Authentication auth) {
        if (securityDisabled) return true;
        if (auth == null) return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (ga.getAuthority().equals("ROLE_ADMIN")) return true;
        }
        return false;
    }
}
