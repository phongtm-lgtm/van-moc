package com.vanmoc.cart.repository;

import com.vanmoc.cart.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.UUID;

public interface CartItemJpaRepository extends JpaRepository<CartItemEntity, UUID> {
    boolean existsByProductId(UUID productId);
    @EntityGraph(attributePaths = {"product", "product.category"})
    List<CartItemEntity> findByCartIdOrderByCreatedAtAscIdAsc(UUID cartId);

    @org.springframework.data.jpa.repository.Query("select i from CartItemEntity i where i.cart.id = :cartId order by i.createdAt, i.id")
    List<CartItemEntity> findCheckoutItems(UUID cartId);
}
