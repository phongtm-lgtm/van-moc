package com.vanmoc.product.repository;

import com.vanmoc.product.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findByActiveTrueOrderByDisplayOrderAscNameAsc();
    boolean existsBySlug(String slug);
}
