package com.vanmoc.user.service;

import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Test-only principal; no fake authentication endpoint exists in the application. */
public final class OidcTestIdentity {
    private OidcTestIdentity() {}
    public static OidcUser principal(UUID id) {
        var token = new OidcIdToken("test-token", Instant.now(), Instant.now().plusSeconds(60), Map.of("sub", "test-subject"));
        return GoogleOidcUserService.principal(new DefaultOidcUser(List.of(new SimpleGrantedAuthority("OIDC_USER")), token), id, "CUSTOMER");
    }
}
