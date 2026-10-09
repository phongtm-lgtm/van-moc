package com.vanmoc.payment.dto.response;

import com.vanmoc.payment.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(PaymentStatus status, BigDecimal amount, String transferCode,
        Instant expiresAt, String bank, String accountNumber, String qrUrl) {}
