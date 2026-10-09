package com.vanmoc.order.initializer;

import com.vanmoc.order.repository.PaymentOrderRepository;
import com.vanmoc.order.service.OrderLifecycleService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.PageRequest;
import java.time.Instant;

@Component
@EnableScheduling
public class OrderExpiryJob {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderExpiryJob.class);
    private final PaymentOrderRepository orders;
    private final OrderLifecycleService lifecycle;
    public OrderExpiryJob(PaymentOrderRepository orders, OrderLifecycleService lifecycle) {
        this.orders = orders; this.lifecycle = lifecycle;
    }
    @Scheduled(fixedDelayString = "${app.checkout.expiry-scan-ms:60000}")
    public void expire() {
        for (var id : orders.findExpiredIds(Instant.now(), PageRequest.of(0, 100))) {
            try { lifecycle.expire(id); }
            catch (RuntimeException exception) { log.error("Order expiry failed for {}", id, exception); }
        }
    }
}
