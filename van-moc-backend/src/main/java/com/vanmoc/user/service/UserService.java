package com.vanmoc.user.service;

import com.vanmoc.user.dto.response.MeResponse;
import com.vanmoc.user.dto.request.UpdateProfileRequest;
import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.user.mapper.UserMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class UserService {
    private final UserJpaRepository users;
    public UserService(UserJpaRepository users) { this.users = users; }

    @Transactional
    public MeResponse login(String subject, String email, String name, String avatar) {
        if (subject == null || subject.isBlank() || email == null || email.isBlank()) fail("invalid_identity");
        var user = users.findByGoogleSubject(subject).orElse(null);
        if (user == null) {
            // Email is not an identity key; never attach a new Google subject to an existing account.
            if (users.existsByEmail(email)) fail("identity_conflict");
            user = new UserEntity();
            user.setGoogleSubject(subject);
        } else if (!user.isActive()) fail("account_disabled");
        user.setEmail(email);
        if (user.getFullName() == null || user.getFullName().isBlank()) user.setFullName(name);
        user.setAvatarUrl(avatar);
        try { return UserMapper.toResponse(users.saveAndFlush(user)); }
        catch (org.springframework.dao.DataIntegrityViolationException exception) {
            throw new OAuth2AuthenticationException(new OAuth2Error("identity_conflict"));
        }
    }

    @Transactional(readOnly = true)
    public MeResponse me(UUID id) {
        var user = users.findById(id).filter(UserEntity::isActive)
                .orElseThrow(() -> new AccessDeniedException("Account unavailable"));
        return UserMapper.toResponse(user);
    }

    @Transactional
    public MeResponse updateProfile(UUID id, UpdateProfileRequest request) {
        var user = users.findById(id).filter(UserEntity::isActive)
                .orElseThrow(() -> new AccessDeniedException("Account unavailable"));
        user.setFullName(request.fullName().strip());
        return UserMapper.toResponse(users.save(user));
    }

    private void fail(String code) { throw new OAuth2AuthenticationException(new OAuth2Error(code)); }
}
