package com.vanmoc.product.repository;

import com.vanmoc.product.entity.ProductEngravingPositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProductEngravingPositionJpaRepository extends JpaRepository<ProductEngravingPositionEntity, UUID> {
    List<ProductEngravingPositionEntity> findByProductIdOrderByDisplayOrderAscIdAsc(UUID productId);
}
