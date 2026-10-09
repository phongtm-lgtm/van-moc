package com.vanmoc.payment.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.UUID;

@Repository
public class SePayEventRepository {
    private final JdbcTemplate jdbc;
    public SePayEventRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public boolean insert(String transactionId, String code, BigDecimal amount, String payload) {
        return jdbc.update("""
                insert into payment_webhook_events(id, provider, provider_event_id, provider_transaction_id,
                  transfer_code, amount, raw_payload, processing_status, received_at, created_at, updated_at)
                values (?, 'SEPAY', ?, ?, ?, ?, cast(? as jsonb), 'RECEIVED', now(), now(), now())
                on conflict do nothing
                """, UUID.randomUUID(), transactionId, transactionId, code, amount, payload) == 1;
    }
    public void finish(String id, UUID paymentId, String status, String reason) {
        jdbc.update("""
                update payment_webhook_events set payment_id=?, processing_status=?, failure_reason=?,
                processed_at=now(), updated_at=now() where provider='SEPAY' and provider_event_id=?
                """, paymentId, status, reason, id);
    }
    public boolean requiresReconciliation(UUID paymentId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("select exists(select 1 from payment_webhook_events where payment_id=? and processing_status='REJECTED')", Boolean.class, paymentId));
    }
}
