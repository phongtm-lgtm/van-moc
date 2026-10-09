package com.vanmoc.payment.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.order.entity.OrderEntity;
import com.vanmoc.payment.enums.PaymentMethod;
import com.vanmoc.payment.enums.PaymentProvider;
import com.vanmoc.payment.enums.PaymentStatus;
import jakarta.persistence.Version;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "payments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payments_order", columnNames = "order_id"),
        @UniqueConstraint(name = "uk_payments_transfer_code", columnNames = "transfer_code"),
        @UniqueConstraint(name = "uk_payments_provider_transaction", columnNames = "provider_transaction_id")
})
public class PaymentEntity extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", updatable = false)
    private OrderEntity order;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "expected_amount", updatable = false, precision = 15, scale = 2)
    private BigDecimal expectedAmount;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "transfer_code", updatable = false)
    private String transferCode;

    @Column(name = "provider_transaction_id")
    private String providerTransactionId;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Version
    private long version;
}
