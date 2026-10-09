package com.vanmoc.user.controller;
import com.vanmoc.user.service.*;
import com.vanmoc.user.dto.response.MeResponse;
import com.vanmoc.user.enums.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
public class AdminSessionController {
    private final UserService users;
    public AdminSessionController(UserService users) { this.users = users; }
    @GetMapping("/api/admin/me") public MeResponse me(Authentication authentication) {
        var user = users.me(AdminIdentity.id(authentication));
        if (user.role() != UserRole.ADMIN) throw new org.springframework.security.access.AccessDeniedException("Admin required");
        return user;
    }
}
