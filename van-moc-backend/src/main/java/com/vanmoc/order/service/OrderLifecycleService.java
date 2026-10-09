package com.vanmoc.order.service;

import com.vanmoc.order.entity.OrderEntity;
import com.vanmoc.order.entity.OrderStatusHistoryEntity;
import com.vanmoc.order.enums.*;
import com.vanmoc.order.repository.*;
import com.vanmoc.payment.repository.PaymentJpaRepository;
import com.vanmoc.payment.enums.*;
import com.vanmoc.product.repository.ProductJpaRepository;
import com.vanmoc.inventory.entity.StockMovementEntity;
import com.vanmoc.inventory.enums.StockMovementReason;
import com.vanmoc.inventory.repository.StockMovementJpaRepository;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.shared.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Service
public class OrderLifecycleService {
    private final PaymentOrderRepository orders;
    private final PaymentJpaRepository payments;
    private final OrderItemJpaRepository items;
    private final ProductJpaRepository products;
    private final StockMovementJpaRepository stock;
    private final OrderHistoryJpaRepository history;
    private final UserJpaRepository users;

    public OrderLifecycleService(PaymentOrderRepository orders, PaymentJpaRepository payments,
            OrderItemJpaRepository items, ProductJpaRepository products, StockMovementJpaRepository stock,
            OrderHistoryJpaRepository history, UserJpaRepository users) {
        this.orders = orders; this.payments = payments; this.items = items; this.products = products;
        this.stock = stock; this.history = history; this.users = users;
    }

    @Transactional
    public void cancel(UUID userId, UUID orderId) {
        var user = users.findById(userId).filter(u -> u.isActive())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Account unavailable"));
        var order = orders.lockById(orderId).filter(o -> o.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND"));
        var payment = payments.lockByOrderId(orderId).orElseThrow();
        if (order.getStatus() == OrderStatus.CANCELLED) return;
        if (payment.getStatus() != PaymentStatus.PENDING
                || !(order.getPaymentMethod() == PaymentMethod.COD && order.getStatus() == OrderStatus.PENDING_CONFIRMATION
                || order.getPaymentMethod() == PaymentMethod.BANK_TRANSFER && order.getStatus() == OrderStatus.PENDING_PAYMENT))
            throw new RuleException("ORDER_CANNOT_CANCEL", HttpStatus.CONFLICT);
        restore(order, StockMovementReason.ORDER_CANCELLED);
        payment.setStatus(PaymentStatus.FAILED); payment.setFailedAt(Instant.now());
        change(order, OrderStatus.CANCELLED, OrderStatusActorType.CUSTOMER, user);
    }

    @Transactional
    public void expire(UUID orderId) {
        var order = orders.lockById(orderId).orElseThrow();
        var payment = payments.lockByOrderId(orderId).orElseThrow();
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT || payment.getStatus() != PaymentStatus.PENDING
                || order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER || payment.getExpiresAt() == null
                || Instant.now().isBefore(payment.getExpiresAt())) return;
        restore(order, StockMovementReason.PAYMENT_EXPIRED);
        payment.setStatus(PaymentStatus.EXPIRED);
        change(order, OrderStatus.CANCELLED, OrderStatusActorType.SYSTEM, null);
    }

    @Transactional
    public void advance(UUID adminId, UUID orderId, OrderStatus next, boolean collectCod) {
        var admin = users.findById(adminId).filter(u -> u.isActive() && u.getRole() == UserRole.ADMIN)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Admin required"));
        var order = orders.lockById(orderId).orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND"));
        var payment = payments.lockByOrderId(orderId).orElseThrow();
        var flow = List.of(OrderStatus.PENDING_CONFIRMATION, OrderStatus.CONFIRMED, OrderStatus.PROCESSING,
                OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPING, OrderStatus.COMPLETED);
        int index = flow.indexOf(order.getStatus());
        if (index < 0 || index == flow.size() - 1 || next != flow.get(index + 1))
            throw new RuleException("INVALID_ORDER_TRANSITION", HttpStatus.CONFLICT);
        if (order.getPaymentMethod() == PaymentMethod.BANK_TRANSFER && payment.getStatus() != PaymentStatus.PAID)
            throw new RuleException("PAYMENT_REQUIRED", HttpStatus.CONFLICT);
        if (next == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            if (!collectCod || payment.getStatus() != PaymentStatus.PENDING)
                throw new RuleException("COD_COLLECTION_REQUIRED", HttpStatus.CONFLICT);
            payment.setStatus(PaymentStatus.PAID); payment.setPaidAmount(payment.getExpectedAmount()); payment.setPaidAt(Instant.now());
        } else if (collectCod) throw new RuleException("INVALID_COD_COLLECTION", HttpStatus.CONFLICT);
        change(order, next, OrderStatusActorType.ADMIN, admin);
    }

    private void restore(OrderEntity order, StockMovementReason reason) {
        var quantities = new TreeMap<UUID, Integer>();
        for (var item : items.findByOrderIdOrderByCreatedAtAscIdAsc(order.getId()))
            quantities.merge(item.getProduct().getId(), item.getQuantity(), Math::addExact);
        for (var entry : quantities.entrySet()) {
            var product = products.lockById(entry.getKey()).orElseThrow();
            product.setStock(Math.addExact(product.getStock(), entry.getValue()));
            var movement = new StockMovementEntity(); movement.setOrder(order); movement.setProduct(product);
            movement.setQuantityChange(entry.getValue()); movement.setReason(reason); stock.save(movement);
        }
    }

    private void change(OrderEntity order, OrderStatus next, OrderStatusActorType actor,
            com.vanmoc.user.entity.UserEntity user) {
        var event = new OrderStatusHistoryEntity(); event.setOrder(order); event.setPreviousStatus(order.getStatus());
        event.setNewStatus(next); event.setActorType(actor); event.setChangedByUser(user); history.save(event);
        order.setStatus(next);
        var now = Instant.now();
        switch (next) {
            case CANCELLED -> order.setCancelledAt(now);
            case CONFIRMED -> order.setConfirmedAt(now);
            case PROCESSING -> order.setProcessingAt(now);
            case READY_TO_SHIP -> order.setReadyToShipAt(now);
            case SHIPPING -> order.setShippingAt(now);
            case COMPLETED -> order.setCompletedAt(now);
            default -> { }
        }
    }
}
