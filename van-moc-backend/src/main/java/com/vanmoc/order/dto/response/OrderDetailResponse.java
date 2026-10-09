package com.vanmoc.order.dto.response;

import com.vanmoc.order.enums.*;
import com.vanmoc.payment.enums.*;
import com.vanmoc.product.enums.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

public record OrderDetailResponse(UUID id, String orderCode, OrderStatus status, PaymentMethod paymentMethod,
        BigDecimal productSubtotal, BigDecimal engravingTotal, BigDecimal shippingFee, BigDecimal grandTotal,
        String recipientName, String recipientPhone, String addressLine, String wardName, String provinceName,
        String note, Instant createdAt, Instant paymentExpiresAt, List<Item> items, List<Event> timeline) {
    public record Item(UUID id, String productCode, String productName, String imageUrl, int quantity,
            BigDecimal unitPrice, BigDecimal engravingUnitFee, BigDecimal lineTotal,
            String engravingText, String engravingFont, EngravingPosition engravingPosition) {}
    public record Event(OrderStatus previousStatus, OrderStatus newStatus, OrderStatusActorType actorType,
            Instant createdAt, String note) {}
}
