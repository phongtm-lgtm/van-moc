package com.vanmoc.payment.service;

import com.vanmoc.payment.config.SePayConfig;
import com.vanmoc.shared.exception.RuleException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class SePaySignatureService {
    private final SePayConfig config;
    public SePaySignatureService(SePayConfig config) { this.config = config; }
    public void verify(byte[] body, String timestamp, String signature) {
        config.requireConfigured();
        try {
            if (timestamp == null || !timestamp.matches("[0-9]{1,12}") || signature == null
                    || !signature.matches("sha256=[0-9a-f]{64}")) throw new IllegalArgumentException();
            long now = Instant.now().getEpochSecond(), time = Long.parseLong(timestamp);
            if (time < now - 300 || time > now + 300) throw new IllegalArgumentException();
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(config.webhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            mac.update((timestamp + ".").getBytes(StandardCharsets.UTF_8));
            if (!MessageDigest.isEqual(mac.doFinal(body), HexFormat.of().parseHex(signature.substring(7))))
                throw new IllegalArgumentException();
        } catch (IllegalArgumentException exception) {
            throw new RuleException("INVALID_WEBHOOK_SIGNATURE", HttpStatus.UNAUTHORIZED);
        } catch (java.security.GeneralSecurityException exception) { throw new IllegalStateException("HMAC unavailable", exception); }
    }
}
