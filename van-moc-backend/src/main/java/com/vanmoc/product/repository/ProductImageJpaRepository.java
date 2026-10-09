package com.vanmoc.product.repository;

import com.vanmoc.product.entity.ProductImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ProductImageJpaRepository extends JpaRepository<ProductImageEntity, UUID> {
    interface ListImage {
        UUID getProductId();
        String getImageUrl();
    }

    @Query("select i.product.id as productId, i.imageUrl as imageUrl from ProductImageEntity i "
            + "where i.product.id in :productIds and i.mediaType = 'IMAGE' "
            + "order by i.product.id, i.primaryImage desc, i.displayOrder asc, i.id asc")
    List<ListImage> findListImages(@Param("productIds") Collection<UUID> productIds);

    List<ProductImageEntity> findByProductIdOrderByDisplayOrderAscIdAsc(UUID productId);
}
