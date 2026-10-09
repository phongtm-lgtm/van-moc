package com.vanmoc.product.repository;

import com.vanmoc.product.entity.EngravingFontEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EngravingFontJpaRepository extends JpaRepository<EngravingFontEntity, UUID> {
    List<EngravingFontEntity> findAllByOrderByNameAsc();
    Optional<EngravingFontEntity> findByCode(String code);
    boolean existsByCodeAndActiveTrue(String code);
}
