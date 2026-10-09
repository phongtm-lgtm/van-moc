package com.vanmoc.user.service;

import com.vanmoc.user.dto.request.UpdateProfileRequest;
import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.user.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserProfileTest {
    private final UserJpaRepository users = mock(UserJpaRepository.class);
    private final UserService service = new UserService(users);

    @Test
    void updateChangesNameWithoutChangingGoogleIdentity() {
        var id = UUID.randomUUID();
        var user = new UserEntity();
        user.setEmail("customer@example.com");
        user.setGoogleSubject("google-subject");
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(users.save(user)).thenReturn(user);

        var response = service.updateProfile(id, new UpdateProfileRequest("  An Nhiên  "));

        assertEquals("An Nhiên", response.fullName());
        assertEquals("customer@example.com", response.email());
        assertEquals("google-subject", user.getGoogleSubject());
        verify(users).save(user);
    }

    @Test
    void disabledAccountCannotUpdateProfile() {
        var id = UUID.randomUUID();
        var user = new UserEntity();
        user.setActive(false);
        when(users.findById(id)).thenReturn(Optional.of(user));

        assertThrows(AccessDeniedException.class,
                () -> service.updateProfile(id, new UpdateProfileRequest("An Nhiên")));
        verify(users, never()).save(any());
    }

    @Test
    void googleLoginPreservesSavedName() {
        var user = new UserEntity();
        user.setFullName("Tên đã lưu");
        when(users.findByGoogleSubject("google-subject")).thenReturn(Optional.of(user));
        when(users.saveAndFlush(user)).thenReturn(user);

        var response = service.login("google-subject", "customer@example.com", "Tên Google", null);

        assertEquals("Tên đã lưu", response.fullName());
    }
}
