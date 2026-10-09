package com.vanmoc.user.initializer;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import java.util.UUID;

@Component
public class AdminAccountInitializer implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final String password;
    public AdminAccountInitializer(JdbcTemplate jdbc, PasswordEncoder encoder,
            @Value("${ADMIN_INITIAL_PASSWORD:vanmoc@2026}") String password) {
        this.jdbc = jdbc; this.encoder = encoder; this.password = password;
    }
    @Override public void run(ApplicationArguments args) {
        if (Boolean.TRUE.equals(jdbc.queryForObject("select exists(select 1 from users where username='admin')", Boolean.class))) return;
        if (password.isBlank()) throw new IllegalStateException("Admin initial password must not be blank");
        jdbc.update("""
            insert into users(id,username,password_hash,full_name,role,active,created_at,updated_at)
            values (?, 'admin', ?, 'Administrator', 'ADMIN', true, now(), now())
            on conflict (username) do nothing
            """, UUID.randomUUID(), encoder.encode(password));
    }
}
