package com.vanmoc.order.dto.response;
import com.vanmoc.order.enums.OrderStatus;
import com.vanmoc.payment.enums.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.Instant;
public record AdminOrderResponse(UUID id, String orderCode, OrderStatus status, PaymentMethod paymentMethod,
        String recipientName, BigDecimal grandTotal, Instant createdAt, PaymentStatus paymentStatus) {}
