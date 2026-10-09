package com.vanmoc.payment.controller;

import com.vanmoc.payment.service.SePayWebhookService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class SePayWebhookController {
    private final SePayWebhookService service;
    public SePayWebhookController(SePayWebhookService service) { this.service = service; }
    @PostMapping(value = "/api/payments/sepay/webhook", consumes = "application/json")
    public Map<String, Boolean> receive(@RequestBody byte[] body,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-SePay-Signature", required = false) String signature) {
        service.receive(body, timestamp, signature);
        return Map.of("success", true);
    }
}
