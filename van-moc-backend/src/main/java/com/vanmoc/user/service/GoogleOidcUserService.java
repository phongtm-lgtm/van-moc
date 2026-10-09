package com.vanmoc.user.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class GoogleOidcUserService extends OidcUserService {
    private final UserService users;
    public GoogleOidcUserService(UserService users) { this.users = users; }

    @Override
    public OidcUser loadUser(OidcUserRequest request) {
        var google = super.loadUser(request);
        if (!"google".equals(request.getClientRegistration().getRegistrationId())
                || !Boolean.TRUE.equals(google.getEmailVerified())) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_identity"));
        }
        var user = users.login(google.getSubject(), google.getEmail(), google.getFullName(), google.getPicture());
        return principal(google, user.id(), user.role().name());
    }

    static OidcUser principal(OidcUser google, UUID userId, String role) {
        return new AppOidcUser(google, userId, role);
    }

    public static UUID userId(OidcUser principal) {
        if (!(principal instanceof AppOidcUser user)) throw new org.springframework.security.access.AccessDeniedException("Unknown identity");
        return user.userId;
    }

    private static final class AppOidcUser extends DefaultOidcUser {
        private final UUID userId;
        AppOidcUser(OidcUser google, UUID userId, String role) {
            super(List.of(new SimpleGrantedAuthority("ROLE_" + role)), google.getIdToken(), google.getUserInfo());
            this.userId = userId;
        }
        @Override public String getName() { return userId.toString(); }
    }
}
