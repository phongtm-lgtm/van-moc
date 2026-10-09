package com.vanmoc.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;
import com.vanmoc.user.service.AdminIdentity;
import java.util.Optional;
import java.util.UUID;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    @Bean
    AuditorAware<UUID> auditorAware() {
        return () -> {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                try { return Optional.of(AdminIdentity.id(authentication)); }
                catch (org.springframework.security.access.AccessDeniedException ignored) { return Optional.empty(); }
            }
            return Optional.empty();
        };
    }
}
