package com.vanmoc.order.repository;

import com.vanmoc.order.entity.OrderStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrderHistoryJpaRepository extends JpaRepository<OrderStatusHistoryEntity, UUID> {
    java.util.List<OrderStatusHistoryEntity> findByOrderIdOrderByCreatedAtAscIdAsc(UUID orderId);
}
