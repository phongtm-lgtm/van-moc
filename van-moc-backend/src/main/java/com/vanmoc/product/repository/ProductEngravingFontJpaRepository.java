package com.vanmoc.product.repository;

import com.vanmoc.product.entity.ProductEngravingFontEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProductEngravingFontJpaRepository extends JpaRepository<ProductEngravingFontEntity, UUID> {
    List<ProductEngravingFontEntity> findByProductIdOrderByDisplayOrderAscIdAsc(UUID productId);
}
