package com.vanmoc.payment.repository;

import com.vanmoc.payment.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, UUID> {
    Optional<PaymentEntity> findByOrderId(UUID orderId);
    @Query("select p from PaymentEntity p join fetch p.order where p.order.id in :orderIds")
    java.util.List<PaymentEntity> findByOrderIds(java.util.Collection<UUID> orderIds);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PaymentEntity p where p.order.id = :orderId")
    Optional<PaymentEntity> lockByOrderId(UUID orderId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PaymentEntity p where p.transferCode = :code")
    Optional<PaymentEntity> lockByTransferCode(String code);
    @Query("select p.order.id from PaymentEntity p where p.transferCode = :code")
    Optional<UUID> findOrderIdByTransferCode(String code);
    Optional<PaymentEntity> findByOrderIdAndOrderUserId(UUID orderId, UUID userId);
}
