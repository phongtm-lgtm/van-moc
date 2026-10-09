package com.vanmoc.user.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class GooglePrincipalTest {
    @Test
    void localIdentityAndRoleAreNotTakenFromGoogleClaims() {
        var token = new OidcIdToken("stub", Instant.now(), Instant.now().plusSeconds(60), Map.of("sub", "google-sub", "role", "ADMIN"));
        var google = new DefaultOidcUser(List.of(new SimpleGrantedAuthority("OIDC_USER")), token);
        var id = UUID.randomUUID();
        var principal = GoogleOidcUserService.principal(google, id, "CUSTOMER");
        assertEquals(id, GoogleOidcUserService.userId(principal));
        assertEquals(id.toString(), principal.getName());
        assertEquals(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")), List.copyOf(principal.getAuthorities()));
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> GoogleOidcUserService.userId(google));
    }
}
