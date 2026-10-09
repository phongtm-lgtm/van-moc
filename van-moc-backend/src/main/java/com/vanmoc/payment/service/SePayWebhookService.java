package com.vanmoc.payment.service;

import com.vanmoc.payment.config.SePayConfig;
import com.vanmoc.payment.repository.*;
import com.vanmoc.payment.enums.*;
import com.vanmoc.order.repository.*;
import com.vanmoc.order.entity.OrderStatusHistoryEntity;
import com.vanmoc.order.enums.*;
import com.vanmoc.shared.exception.RuleException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
public class SePayWebhookService {
    private static final java.util.regex.Pattern CONTENT_CODE = java.util.regex.Pattern.compile(
            "(?<![A-Z0-9])SEVQR\\s+(VM[A-F0-9]{8})(?![A-Z0-9])");

    static String transferCode(String code, String content) {
        if (code != null && !code.isBlank()) return code;
        var matcher = CONTENT_CODE.matcher(content == null ? "" : content);
        String found = "";
        while (matcher.find()) {
            if (!found.isEmpty() && !found.equals(matcher.group(1))) return "";
            found = matcher.group(1);
        }
        return found;
    }
    private final SePaySignatureService signatures;
    private final SePayConfig config;
    private final SePayEventRepository events;
    private final PaymentJpaRepository payments;
    private final PaymentOrderRepository orders;
    private final OrderHistoryJpaRepository history;
    private final ObjectMapper json;
    public SePayWebhookService(SePaySignatureService signatures, SePayConfig config, SePayEventRepository events,
            PaymentJpaRepository payments, PaymentOrderRepository orders, OrderHistoryJpaRepository history, ObjectMapper json) {
        this.signatures = signatures; this.config = config; this.events = events; this.payments = payments;
        this.orders = orders; this.history = history; this.json = json;
    }
    @Transactional
    public void receive(byte[] raw, String timestamp, String signature) {
        signatures.verify(raw, timestamp, signature);
        if (raw.length > 65536) throw new RuleException("INVALID_WEBHOOK_PAYLOAD", HttpStatus.BAD_REQUEST);
        tools.jackson.databind.JsonNode data;
        try { data = json.readTree(raw); } catch (RuntimeException exception) {
            throw new RuleException("INVALID_WEBHOOK_PAYLOAD", HttpStatus.BAD_REQUEST);
        }
        if (data == null || !data.isObject() || !data.path("id").isIntegralNumber()
                || !data.path("transferAmount").isIntegralNumber() || data.path("transferAmount").decimalValue().signum() <= 0
                || data.path("transferAmount").decimalValue().precision() > 13)
            throw new RuleException("INVALID_WEBHOOK_PAYLOAD", HttpStatus.BAD_REQUEST);
        // Dashboard's Send Test uses id=0: acknowledge without creating a real payment event.
        if (data.path("id").asLong() == 0) return;
        if (data.path("id").asLong() < 0) throw new RuleException("INVALID_WEBHOOK_PAYLOAD", HttpStatus.BAD_REQUEST);
        String id = data.path("id").asText(), code = transferCode(
                data.path("code").asText(""), data.path("content").asText(""));
        if (code.length() > 255) throw new RuleException("INVALID_WEBHOOK_PAYLOAD", HttpStatus.BAD_REQUEST);
        var amount = data.path("transferAmount").decimalValue();
        if (!events.insert(id, code, amount, new String(raw, StandardCharsets.UTF_8))) return;
        if (!"in".equals(data.path("transferType").asText()) || !config.accountNumber().equals(data.path("accountNumber").asText())
                || !config.bank().equals(data.path("gateway").asText())) {
            events.finish(id, null, "REJECTED", "WRONG_DIRECTION_OR_ACCOUNT_OR_BANK"); return;
        }
        var orderId = payments.findOrderIdByTransferCode(code).orElse(null);
        if (orderId == null) { events.finish(id, null, "UNMATCHED", "UNKNOWN_TRANSFER_CODE"); return; }
        var order = orders.lockById(orderId).orElseThrow();
        var payment = payments.lockByOrderId(order.getId()).orElseThrow();
        var now = Instant.now();
        if (payment.getMethod() != PaymentMethod.BANK_TRANSFER || payment.getProvider() != PaymentProvider.SEPAY
                || payment.getStatus() != PaymentStatus.PENDING || order.getStatus() != OrderStatus.PENDING_PAYMENT
                || payment.getExpiresAt() == null || !now.isBefore(payment.getExpiresAt())
                || payment.getExpectedAmount() == null || payment.getExpectedAmount().compareTo(amount) != 0
                || events.requiresReconciliation(payment.getId())) {
            events.finish(id, payment.getId(), "REJECTED", "MANUAL_RECONCILIATION_REQUIRED"); return;
        }
        payment.setStatus(PaymentStatus.PAID); payment.setPaidAmount(amount); payment.setPaidAt(now); payment.setProviderTransactionId(id);
        order.setStatus(OrderStatus.PENDING_CONFIRMATION);
        var change = new OrderStatusHistoryEntity(); change.setOrder(order);
        change.setPreviousStatus(OrderStatus.PENDING_PAYMENT); change.setNewStatus(OrderStatus.PENDING_CONFIRMATION);
        change.setActorType(OrderStatusActorType.SYSTEM); change.setNote("SePay verified bank transfer"); history.save(change);
        events.finish(id, payment.getId(), "PROCESSED", null);
    }
}
