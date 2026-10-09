package com.vanmoc.payment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public record SePayConfig(@Value("${app.payment.sepay.enabled}") boolean enabled,
        @Value("${app.payment.sepay.webhook-secret}") String webhookSecret,
        @Value("${app.payment.sepay.account-number}") String accountNumber,
        @Value("${app.payment.sepay.bank}") String bank) {
    public void requireConfigured() {
        if (!enabled || webhookSecret.isBlank() || accountNumber.isBlank() || bank.isBlank())
            throw new com.vanmoc.shared.exception.RuleException("PAYMENT_NOT_CONFIGURED", org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
