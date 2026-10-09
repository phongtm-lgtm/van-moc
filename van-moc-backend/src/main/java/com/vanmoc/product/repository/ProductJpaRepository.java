package com.vanmoc.product.repository;

import com.vanmoc.product.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ProductJpaRepository extends JpaRepository<ProductEntity, UUID> {
    boolean existsByCategoryId(UUID categoryId);
    @EntityGraph(attributePaths="category")
    @Query("select p from ProductEntity p where (:category is null or p.category.id=:category) "
            + "and (:active is null or p.active=:active) and (:empty=false or p.stock=0) "
            + "and (lower(p.name) like concat('%',:search,'%') or lower(p.code) like concat('%',:search,'%'))")
    Page<ProductEntity> findAdmin(String search, UUID category, Boolean active, boolean empty, Pageable pageable);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProductEntity p where p.id = :id")
    Optional<ProductEntity> lockById(@Param("id") UUID id);
    @EntityGraph(attributePaths = "category")
    @Query("select p from ProductEntity p where p.active = true and p.category.active = true "
            + "and (:categoryId is null or p.category.id = :categoryId)")
    Page<ProductEntity> findVisible(@Param("categoryId") UUID categoryId, Pageable pageable);

    @Query("select count(p) from ProductEntity p where p.active = true and p.category.active = true "
            + "and (:categoryId is null or p.category.id = :categoryId)")
    long countVisible(@Param("categoryId") UUID categoryId);

    @EntityGraph(attributePaths = "category")
    Optional<ProductEntity> findByIdAndActiveTrueAndCategoryActiveTrue(UUID id);
    @EntityGraph(attributePaths = "category")
    Optional<ProductEntity> findBySlugAndActiveTrueAndCategoryActiveTrue(String slug);
}
