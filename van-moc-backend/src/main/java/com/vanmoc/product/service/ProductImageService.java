package com.vanmoc.product.service;

import com.vanmoc.product.client.S3ProductImageClient;
import com.vanmoc.product.dto.response.ProductImageResponse;
import com.vanmoc.product.entity.ProductImageEntity;
import com.vanmoc.product.mapper.ProductMapper;
import com.vanmoc.product.repository.ProductImageJpaRepository;
import com.vanmoc.product.repository.ProductJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@Service
public class ProductImageService {
    private final AdminProductService adminProducts;
    private final ProductJpaRepository products;
    private final ProductImageJpaRepository images;
    private final S3ProductImageClient storage;
    private final TransactionTemplate transaction;

    public ProductImageService(AdminProductService adminProducts, ProductJpaRepository products,
            ProductImageJpaRepository images, S3ProductImageClient storage, PlatformTransactionManager transactions) {
        this.adminProducts = adminProducts;
        this.products = products;
        this.images = images;
        this.storage = storage;
        this.transaction = new TransactionTemplate(transactions);
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public ProductImageResponse upload(UUID user, UUID productId, MultipartFile file) {
        adminProducts.requireAdmin(user);
        if (!products.existsById(productId)) throw new ResourceNotFoundException("PRODUCT_NOT_FOUND");
        var contentType = file.getContentType();
        if (file.isEmpty() || contentType == null || !java.util.Set.of("image/jpeg", "image/png", "image/webp",
                "image/gif", "image/avif", "video/mp4", "video/webm").contains(contentType))
            throw new com.vanmoc.shared.exception.RuleException("INVALID_PRODUCT_MEDIA", org.springframework.http.HttpStatus.BAD_REQUEST);
        var mediaType = contentType.startsWith("video/") ? "VIDEO" : "IMAGE";

        // S3 network I/O completes before opening the database transaction.
        var uploaded = storage.upload(file);
        return transaction.execute(status -> {
            var product = products.lockById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
            var existing = images.findByProductIdOrderByDisplayOrderAscIdAsc(productId);
            var image = new ProductImageEntity();
            image.setProduct(product);
            image.setStorageKey(uploaded.storageKey());
            image.setImageUrl(uploaded.imageUrl());
            image.setAltText(product.getName());
            image.setMediaType(mediaType);
            image.setPrimaryImage(mediaType.equals("IMAGE") && existing.stream().noneMatch(item -> item.getMediaType().equals("IMAGE")));
            image.setDisplayOrder(existing.stream().mapToInt(ProductImageEntity::getDisplayOrder).max().orElse(-1) + 1);
            return ProductMapper.toImageResponse(images.save(image));
        });
    }

    @Transactional
    public ProductImageResponse setPrimary(UUID user, UUID productId, UUID imageId) {
        adminProducts.requireAdmin(user);
        // Serialize against other primary changes and uploads for this product.
        products.lockById(productId).orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        var existing = images.findByProductIdOrderByDisplayOrderAscIdAsc(productId);
        var selected = existing.stream().filter(image -> image.getId().equals(imageId))
                .findFirst().orElseThrow(() -> new ResourceNotFoundException("PRODUCT_IMAGE_NOT_FOUND"));
        if (!"IMAGE".equals(selected.getMediaType()))
            throw new com.vanmoc.shared.exception.RuleException("INVALID_PRODUCT_MEDIA", org.springframework.http.HttpStatus.BAD_REQUEST);
        if (selected.isPrimaryImage()) return ProductMapper.toImageResponse(selected);

        // PostgreSQL's partial unique index allows only one primary image per product.
        for (var image : existing) {
            if (image.isPrimaryImage()) image.setPrimaryImage(false);
        }
        images.flush();
        selected.setPrimaryImage(true);
        images.flush();
        return ProductMapper.toImageResponse(selected);
    }
}
