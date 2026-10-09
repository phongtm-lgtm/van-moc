package com.vanmoc.order.service;
import com.vanmoc.order.repository.PaymentOrderRepository;
import com.vanmoc.payment.repository.PaymentJpaRepository;
import com.vanmoc.order.dto.response.*;
import com.vanmoc.order.enums.OrderStatus;
import com.vanmoc.payment.enums.PaymentMethod;
import com.vanmoc.user.service.UserService;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import java.util.*;
@Service
public class AdminOrderService {
    private final PaymentOrderRepository orders;
    private final PaymentJpaRepository payments;
    private final OrderReadService reads;
    private final UserService users;
    public AdminOrderService(PaymentOrderRepository orders, PaymentJpaRepository payments, OrderReadService reads, UserService users) {
        this.orders=orders; this.payments=payments; this.reads=reads; this.users=users;
    }
    private void requireAdmin(UUID id) {
        if (users.me(id).role()!=UserRole.ADMIN) throw new org.springframework.security.access.AccessDeniedException("Admin required");
    }
    @Transactional(readOnly=true)
    public Page<AdminOrderResponse> list(UUID id, String search, OrderStatus status, PaymentMethod method, int page) {
        requireAdmin(id);
        var result=orders.findAdminOrders(search.trim().toLowerCase(Locale.ROOT),status,method,
                PageRequest.of(Math.max(page,0),20));
        var paymentStatuses=new HashMap<UUID,com.vanmoc.payment.enums.PaymentStatus>();
        if (!result.isEmpty()) {
            for (var payment:payments.findByOrderIds(result.getContent().stream().map(o->o.getId()).toList()))
                paymentStatuses.put(payment.getOrder().getId(),payment.getStatus());
        }
        return result.map(o->new AdminOrderResponse(o.getId(),o.getOrderCode(),o.getStatus(),o.getPaymentMethod(),
                o.getRecipientName(),o.getGrandTotal(),o.getCreatedAt(),paymentStatuses.get(o.getId())));
    }
    @Transactional(readOnly=true)
    public AdminOrderStatsResponse stats(UUID id) {
        requireAdmin(id);
        return new AdminOrderStatsResponse(orders.count(),orders.countByStatus(OrderStatus.PENDING_CONFIRMATION),
                orders.countByStatus(OrderStatus.CANCELLED));
    }
    @Transactional(readOnly=true)
    public AdminOrderDetailResponse detail(UUID id, UUID orderId) {
        requireAdmin(id);
        var order=orders.findById(orderId).orElseThrow(()->new ResourceNotFoundException("ORDER_NOT_FOUND"));
        var payment=payments.findByOrderId(orderId).orElseThrow(()->new ResourceNotFoundException("PAYMENT_NOT_FOUND"));
        return new AdminOrderDetailResponse(reads.mapDetail(order),payment.getStatus(),payment.getExpectedAmount(),payment.getPaidAmount(),payment.getTransferCode(),payment.getExpiresAt(),payment.getPaidAt());
    }
}
