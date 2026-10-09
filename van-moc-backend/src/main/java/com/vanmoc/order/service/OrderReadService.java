package com.vanmoc.order.service;

import com.vanmoc.order.dto.response.*;
import com.vanmoc.order.entity.OrderEntity;
import com.vanmoc.order.repository.*;
import com.vanmoc.user.service.UserService;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import java.util.UUID;

@Service
public class OrderReadService {
    private final PaymentOrderRepository orders;
    private final OrderItemJpaRepository items;
    private final OrderHistoryJpaRepository history;
    private final UserService users;
    public OrderReadService(PaymentOrderRepository orders, OrderItemJpaRepository items,
            OrderHistoryJpaRepository history, UserService users) {
        this.orders = orders; this.items = items; this.history = history; this.users = users;
    }
    @Transactional(readOnly = true)
    public Page<CheckoutResponse> list(UUID userId, int page) {
        users.me(userId);
        return orders.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(Math.max(0, page), 20))
                .map(o -> new CheckoutResponse(o.getId(), o.getOrderCode(), o.getStatus(),
                        o.getProductSubtotal(), o.getEngravingTotal(), o.getShippingFee(), o.getGrandTotal()));
    }
    @Transactional(readOnly = true)
    public OrderDetailResponse detail(UUID userId, UUID orderId) {
        users.me(userId);
        OrderEntity o = orders.findById(orderId).filter(order -> order.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND"));
        return mapDetail(o);
    }
    public OrderDetailResponse mapDetail(OrderEntity o) {
        var orderId = o.getId();
        var lines = items.findByOrderIdOrderByCreatedAtAscIdAsc(orderId).stream()
                .map(i -> new OrderDetailResponse.Item(i.getId(), i.getProductCode(), i.getProductName(),
                        i.getProductImageUrl(), i.getQuantity(), i.getUnitPrice(), i.getEngravingUnitFee(),
                        i.getLineTotal(), i.getEngravingText(), i.getEngravingFont(), i.getEngravingPosition())).toList();
        var events = history.findByOrderIdOrderByCreatedAtAscIdAsc(orderId).stream()
                .map(e -> new OrderDetailResponse.Event(e.getPreviousStatus(), e.getNewStatus(), e.getActorType(),
                        e.getCreatedAt(), e.getNote())).toList();
        return new OrderDetailResponse(o.getId(), o.getOrderCode(), o.getStatus(), o.getPaymentMethod(),
                o.getProductSubtotal(), o.getEngravingTotal(), o.getShippingFee(), o.getGrandTotal(),
                o.getRecipientName(), o.getRecipientPhone(), o.getShippingAddressLine(), o.getShippingWardName(),
                o.getShippingProvinceName(), o.getCustomerNote(), o.getCreatedAt(), o.getPaymentExpiresAt(), lines, events);
    }
}
