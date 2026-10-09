package com.vanmoc.user.service;

import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.user.repository.UserJpaRepository;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtServiceTest {
    private static final String SECRET = "a-secret-of-more-than-thirty-two-bytes-for-tests";

    @Test
    void acceptsOnlySignedUnexpiredTokensForActiveGoogleUsers() {
        var users = mock(UserJpaRepository.class);
        var id = UUID.randomUUID();
        var user = new UserEntity();
        user.setGoogleSubject("google-subject");
        when(users.findById(id)).thenReturn(Optional.of(user));
        var jwt = new JwtService(SECRET, 3600, new JsonMapper(), users);
        var token = jwt.issue(id);
        var auth = jwt.authenticate(token);
        assertNotNull(auth);
        assertEquals(id, AdminIdentity.id(auth));
        assertEquals(java.util.List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")), java.util.List.copyOf(auth.getAuthorities()));

        assertNull(jwt.authenticate(token.substring(0, token.length() - 2) + "xx"));
        assertNull(jwt.authenticate(token.replaceFirst("^([^.]*)", Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"none\"}".getBytes()))));
        user.setActive(false);
        assertNull(jwt.authenticate(token));
    }

    @Test
    void rejectsMalformedAndExpiredTokens() {
        var jwt = new JwtService(SECRET, 1, new JsonMapper(), mock(UserJpaRepository.class));
        assertNull(jwt.authenticate("bad.token"));
        assertNull(jwt.authenticate(null));
        assertThrows(IllegalArgumentException.class,
                () -> new JwtService("short", 3600, new JsonMapper(), mock(UserJpaRepository.class)));
    }
}
