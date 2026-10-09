package com.vanmoc.inventory.repository;
import com.vanmoc.inventory.entity.StockMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface StockMovementJpaRepository extends JpaRepository<StockMovementEntity, UUID> {
    boolean existsByProductId(UUID productId);
    org.springframework.data.domain.Page<StockMovementEntity> findByProductId(UUID productId,org.springframework.data.domain.Pageable pageable);
}
