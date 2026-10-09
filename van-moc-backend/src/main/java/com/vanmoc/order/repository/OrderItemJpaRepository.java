package com.vanmoc.order.repository;
import com.vanmoc.order.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface OrderItemJpaRepository extends JpaRepository<OrderItemEntity, UUID> {
    java.util.List<OrderItemEntity> findByOrderIdOrderByCreatedAtAscIdAsc(UUID orderId);
    boolean existsByProductId(UUID productId);
}
