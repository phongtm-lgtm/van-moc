package com.vanmoc.user.service;

import tools.jackson.databind.ObjectMapper;
import com.vanmoc.user.repository.UserJpaRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import com.vanmoc.user.enums.UserRole;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final String HEADER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private final byte[] secret;
    private final ObjectMapper json;
    private final UserJpaRepository users;
    private final long ttlSeconds;

    public JwtService(@Value("${app.auth.jwt-secret}") String secret,
                      @Value("${app.auth.jwt-ttl-seconds:3600}") long ttlSeconds,
                      ObjectMapper json, UserJpaRepository users) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32 || ttlSeconds < 1) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes and TTL must be positive");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
        this.json = json;
        this.users = users;
    }

    public long ttlSeconds() { return ttlSeconds; }

    public String issue(UUID id) {
        return issue(id, "access");
    }

    public String issueAdmin(UUID id) {
        return issue(id, "admin");
    }

    private String issue(UUID id, String type) {
        try {
            var payload = ENCODER.encodeToString(json.writeValueAsBytes(Map.of(
                    "sub", id.toString(), "exp", Instant.now().plusSeconds(ttlSeconds).getEpochSecond(),
                    "iss", "van-moc", "typ", type)));
            var content = HEADER + "." + payload;
            return content + "." + ENCODER.encodeToString(sign(content));
        } catch (Exception exception) { throw new IllegalStateException("Cannot issue access token", exception); }
    }

    public Authentication authenticate(String token) {
        return authenticate(token, "access");
    }

    public Authentication authenticateAdmin(String token) {
        return authenticate(token, "admin");
    }

    private Authentication authenticate(String token, String type) {
        try {
            if (token == null || token.length() > 4096) return null;
            var parts = token.split("\\.", -1);
            if (parts.length != 3 || !HEADER.equals(parts[0])) return null;
            if (!MessageDigest.isEqual(sign(parts[0] + "." + parts[1]), DECODER.decode(parts[2]))) return null;
            var claims = json.readTree(DECODER.decode(parts[1]));
            if (!"van-moc".equals(claims.path("iss").asText()) || !type.equals(claims.path("typ").asText())
                    || !claims.path("exp").isIntegralNumber() || claims.path("exp").asLong() <= Instant.now().getEpochSecond()) return null;
            var id = UUID.fromString(claims.path("sub").asText());
            var user = users.findById(id).orElse(null);
            if (user == null || !user.isActive() || ("admin".equals(type)
                    ? user.getRole() != UserRole.ADMIN || user.getPasswordHash() == null
                    : user.getGoogleSubject() == null)) return null;
            return new UsernamePasswordAuthenticationToken(new JwtIdentity(id), null,
                    java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        } catch (Exception exception) { return null; }
    }

    private byte[] sign(String data) throws Exception {
        var mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.US_ASCII));
    }
}
