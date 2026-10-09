package com.vanmoc.order.dto.response;

import java.math.BigDecimal;
import java.util.UUID;
import com.vanmoc.order.enums.OrderStatus;

public record CheckoutResponse(UUID orderId, String orderCode, OrderStatus status,
        BigDecimal productSubtotal, BigDecimal engravingTotal, BigDecimal shippingFee, BigDecimal grandTotal) {}
