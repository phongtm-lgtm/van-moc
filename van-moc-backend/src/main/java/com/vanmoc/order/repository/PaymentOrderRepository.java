package com.vanmoc.order.repository;

import com.vanmoc.order.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<OrderEntity, UUID> {
    @Query("select o from OrderEntity o where (:status is null or o.status = :status) "
            + "and (:method is null or o.paymentMethod = :method) and lower(o.orderCode) like concat('%', :search, '%') "
            + "order by case when o.status = com.vanmoc.order.enums.OrderStatus.PENDING_CONFIRMATION then 0 else 1 end, o.createdAt desc, o.id desc")
    org.springframework.data.domain.Page<OrderEntity> findAdminOrders(String search,
            com.vanmoc.order.enums.OrderStatus status, com.vanmoc.payment.enums.PaymentMethod method,
            org.springframework.data.domain.Pageable pageable);
    Optional<OrderEntity> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);
    long countByStatus(com.vanmoc.order.enums.OrderStatus status);
    org.springframework.data.domain.Page<OrderEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, org.springframework.data.domain.Pageable pageable);
    @Query("select o.id from OrderEntity o where o.status = com.vanmoc.order.enums.OrderStatus.PENDING_PAYMENT and o.paymentExpiresAt <= :now")
    java.util.List<UUID> findExpiredIds(java.time.Instant now, org.springframework.data.domain.Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OrderEntity o where o.id = :id")
    Optional<OrderEntity> lockById(UUID id);
}
