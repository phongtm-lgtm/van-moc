package com.vanmoc.user.service;
import java.util.UUID;
import org.springframework.security.core.Authentication;
public final class AdminIdentity {
    private AdminIdentity() {}
    public static UUID id(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) throw new org.springframework.security.access.AccessDeniedException("Admin required");
        if (auth.getPrincipal() instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser oidc)
            return GoogleOidcUserService.userId(oidc);
        if (auth.getPrincipal() instanceof JwtIdentity jwt) return jwt.id();
        try { return UUID.fromString(auth.getName()); }
        catch (IllegalArgumentException exception) { throw new org.springframework.security.access.AccessDeniedException("Unknown identity"); }
    }
}
