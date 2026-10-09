package com.vanmoc.payment.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.payment.enums.PaymentProvider;
import com.vanmoc.payment.enums.WebhookProcessingStatus;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "payment_webhook_events", uniqueConstraints = {
        @UniqueConstraint(name = "uk_webhook_provider_event", columnNames = {"provider", "provider_event_id"}),
        @UniqueConstraint(name = "uk_webhook_provider_transaction", columnNames = {"provider", "provider_transaction_id"})
})
public class PaymentWebhookEventEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentEntity payment;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private PaymentProvider provider;

    @Column(name = "provider_event_id", updatable = false)
    private String providerEventId;

    @Column(name = "provider_transaction_id", updatable = false)
    private String providerTransactionId;

    @Column(name = "transfer_code", updatable = false)
    private String transferCode;

    @Column(updatable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", updatable = false, columnDefinition = "jsonb")
    private String rawPayload;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status")
    private WebhookProcessingStatus processingStatus;

    @Column(name = "failure_reason", columnDefinition = "text")
    private String failureReason;

    @Column(name = "received_at", updatable = false)
    private Instant receivedAt;

    @Column(name = "processed_at")
    private Instant processedAt;
}
