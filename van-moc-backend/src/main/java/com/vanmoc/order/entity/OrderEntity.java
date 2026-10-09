package com.vanmoc.order.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.payment.enums.PaymentMethod;
import com.vanmoc.order.enums.OrderStatus;
import com.vanmoc.user.entity.UserEntity;
import jakarta.persistence.Version;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "orders", uniqueConstraints = {
        @UniqueConstraint(name = "uk_orders_order_code", columnNames = "order_code"),
        @UniqueConstraint(name = "uk_orders_user_idempotency_key", columnNames = {"user_id", "idempotency_key"})
})
public class OrderEntity extends BaseEntity {

    @Column(name = "order_code", updatable = false)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", updatable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", updatable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "product_subtotal", updatable = false, precision = 15, scale = 2)
    private BigDecimal productSubtotal;

    @Column(name = "engraving_total", updatable = false, precision = 15, scale = 2)
    private BigDecimal engravingTotal;

    @Column(name = "shipping_fee", updatable = false, precision = 15, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "grand_total", updatable = false, precision = 15, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "recipient_name", updatable = false)
    private String recipientName;

    @Column(name = "recipient_phone", updatable = false)
    private String recipientPhone;

    @Column(name = "shipping_province_code", updatable = false)
    private Integer shippingProvinceCode;

    @Column(name = "shipping_province_name", updatable = false)
    private String shippingProvinceName;

    @Column(name = "shipping_ward_code", updatable = false)
    private Integer shippingWardCode;

    @Column(name = "shipping_ward_name", updatable = false)
    private String shippingWardName;

    @Column(name = "shipping_address_line", updatable = false, columnDefinition = "text")
    private String shippingAddressLine;

    @Column(name = "customer_note", updatable = false, columnDefinition = "text")
    private String customerNote;

    @Column(name = "idempotency_key", updatable = false)
    private String idempotencyKey;

    @Column(name = "request_hash", updatable = false)
    private String requestHash;

    @Version
    private long version;

    @Column(name = "payment_expires_at")
    private Instant paymentExpiresAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "processing_at")
    private Instant processingAt;

    @Column(name = "ready_to_ship_at")
    private Instant readyToShipAt;

    @Column(name = "shipping_at")
    private Instant shippingAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;
}
