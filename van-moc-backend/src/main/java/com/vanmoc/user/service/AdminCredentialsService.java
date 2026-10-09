package com.vanmoc.user.service;

import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.user.enums.UserRole;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCredentialsService implements UserDetailsService {
    private final UserJpaRepository users;
    public AdminCredentialsService(UserJpaRepository users) { this.users = users; }
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        var user = users.findByUsername(username).filter(u -> u.isActive() && u.getRole() == UserRole.ADMIN && u.getPasswordHash() != null)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid admin credentials"));
        return User.withUsername(user.getId().toString()).password(user.getPasswordHash()).roles("ADMIN").build();
    }
}
