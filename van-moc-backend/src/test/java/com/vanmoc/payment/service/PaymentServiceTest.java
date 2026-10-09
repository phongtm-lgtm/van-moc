package com.vanmoc.payment.service;

import com.vanmoc.payment.config.SePayConfig;
import com.vanmoc.payment.entity.PaymentEntity;
import com.vanmoc.payment.enums.PaymentMethod;
import com.vanmoc.payment.enums.PaymentProvider;
import com.vanmoc.payment.enums.PaymentStatus;
import com.vanmoc.payment.repository.PaymentJpaRepository;
import com.vanmoc.user.service.UserService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class PaymentServiceTest {
    @Test
    void bankTransferQrStartsWithVietinBankRequiredPrefixButRetainsOrderCode() {
        var payments = mock(PaymentJpaRepository.class);
        var users = mock(UserService.class);
        var ownerId = UUID.randomUUID();
        var orderId = UUID.randomUUID();
        var payment = new PaymentEntity();
        payment.setMethod(PaymentMethod.BANK_TRANSFER);
        payment.setProvider(PaymentProvider.SEPAY);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setExpiresAt(Instant.now().plusSeconds(900));
        payment.setTransferCode("VM1234ABCD");
        payment.setExpectedAmount(new BigDecimal("100000"));
        when(payments.findByOrderIdAndOrderUserId(orderId, ownerId)).thenReturn(Optional.of(payment));

        var response = new PaymentService(payments, users,
                new SePayConfig(true, "test-secret", "104879639091", "VietinBank")).get(ownerId, orderId);

        assertEquals("VM1234ABCD", response.transferCode());
        assertEquals("https://vietqr.app/img?acc=104879639091&bank=VietinBank&amount=100000&des=SEVQR%20VM1234ABCD",
                response.qrUrl());
        verify(users).me(ownerId);
    }
}
