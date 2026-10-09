package com.vanmoc.payment.service;

import com.vanmoc.payment.config.SePayConfig;
import com.vanmoc.payment.dto.response.PaymentResponse;
import com.vanmoc.payment.enums.*;
import com.vanmoc.payment.repository.PaymentJpaRepository;
import com.vanmoc.user.service.UserService;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentService {
    private final PaymentJpaRepository payments;
    private final UserService users;
    private final SePayConfig config;
    public PaymentService(PaymentJpaRepository payments, UserService users, SePayConfig config) {
        this.payments = payments; this.users = users; this.config = config;
    }
    @Transactional(readOnly = true)
    public PaymentResponse get(UUID userId, UUID orderId) {
        users.me(userId);
        var payment = payments.findByOrderIdAndOrderUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("PAYMENT_NOT_FOUND"));
        String qr = null;
        if (payment.getMethod() == PaymentMethod.BANK_TRANSFER && payment.getProvider() == PaymentProvider.SEPAY
                && payment.getStatus() == PaymentStatus.PENDING && payment.getExpiresAt() != null
                && Instant.now().isBefore(payment.getExpiresAt())) {
            config.requireConfigured();
            qr = UriComponentsBuilder.fromUriString("https://vietqr.app/img")
                    .queryParam("acc", config.accountNumber()).queryParam("bank", config.bank())
                    .queryParam("amount", payment.getExpectedAmount().toBigIntegerExact().toString())
                    .queryParam("des", payment.getTransferCode()).build().encode().toUriString();
        }
        return new PaymentResponse(payment.getStatus(), payment.getExpectedAmount(), payment.getTransferCode(),
                payment.getExpiresAt(), payment.getMethod() == PaymentMethod.BANK_TRANSFER ? config.bank() : null,
                payment.getMethod() == PaymentMethod.BANK_TRANSFER ? config.accountNumber() : null, qr);
    }
}
