package com.vanmoc.order.dto.response;
import com.vanmoc.payment.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
public record AdminOrderDetailResponse(OrderDetailResponse order, PaymentStatus paymentStatus,
        BigDecimal expectedAmount, BigDecimal paidAmount, String transferCode, Instant expiresAt, Instant paidAt) {}
