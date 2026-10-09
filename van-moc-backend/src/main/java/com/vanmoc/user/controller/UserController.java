package com.vanmoc.user.controller;

import com.vanmoc.user.dto.response.MeResponse;
import com.vanmoc.user.dto.request.UpdateProfileRequest;
import jakarta.validation.Valid;
import com.vanmoc.user.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }
    @GetMapping("/api/me")
    public MeResponse me(org.springframework.security.core.Authentication principal) {
        return users.me(com.vanmoc.user.service.AdminIdentity.id(principal));
    }
    @PatchMapping("/api/me")
    public MeResponse update(org.springframework.security.core.Authentication principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return users.updateProfile(com.vanmoc.user.service.AdminIdentity.id(principal), request);
    }
}
