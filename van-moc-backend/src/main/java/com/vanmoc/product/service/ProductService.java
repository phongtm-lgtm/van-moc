package com.vanmoc.product.service;

import com.vanmoc.product.dto.response.*;
import com.vanmoc.product.mapper.ProductMapper;
import com.vanmoc.product.repository.*;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.HashMap;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private final CategoryJpaRepository categories;
    private final ProductJpaRepository products;
    private final ProductImageJpaRepository images;
    private final ProductEngravingFontJpaRepository fonts;
    private final ProductEngravingPositionJpaRepository positions;

    public ProductService(CategoryJpaRepository categories, ProductJpaRepository products,
            ProductImageJpaRepository images, ProductEngravingFontJpaRepository fonts,
            ProductEngravingPositionJpaRepository positions) {
        this.categories = categories;
        this.products = products;
        this.images = images;
        this.fonts = fonts;
        this.positions = positions;
    }

    public List<CategoryResponse> getCategories() {
        return categories.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(ProductMapper::toResponse).toList();
    }

    public ProductPageResponse getProducts(UUID categoryId, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Invalid pagination");
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.asc("id")));
        var result = products.findVisible(categoryId, pageable);
        var imageUrls = new HashMap<UUID, String>();
        if (!result.isEmpty()) {
            for (var image : images.findListImages(result.getContent().stream().map(p -> p.getId()).toList())) {
                // containsKey preserves the first image even when its URL is null.
                if (!imageUrls.containsKey(image.getProductId())) {
                    imageUrls.put(image.getProductId(), image.getImageUrl());
                }
            }
        }
        return new ProductPageResponse(result.getContent().stream()
                .map(product -> ProductMapper.toResponse(product, imageUrls.get(product.getId()))).toList(),
                page, size, result.getTotalElements(), result.getTotalPages());
    }

    public List<ProductResponse> getFeaturedProducts() {
        var featured = products.findFeatured(PageRequest.of(0, 12,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.asc("id")))).getContent();
        if (featured.isEmpty()) return List.of();
        var imageUrls = new HashMap<UUID, String>();
        for (var image : images.findListImages(featured.stream().map(p -> p.getId()).toList())) {
            if (!imageUrls.containsKey(image.getProductId())) imageUrls.put(image.getProductId(), image.getImageUrl());
        }
        return featured.stream().map(p -> ProductMapper.toResponse(p, imageUrls.get(p.getId()))).toList();
    }

    public ProductDetailResponse getProductDetail(UUID id) {
        var product = products.findByIdAndActiveTrueAndCategoryActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        return detail(product);
    }

    public ProductDetailResponse getProductDetailBySlug(String slug) {
        var product = products.findBySlugAndActiveTrueAndCategoryActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        return detail(product);
    }

    private ProductDetailResponse detail(com.vanmoc.product.entity.ProductEntity product) {
        var id = product.getId();
        var engravingPositions = positions.findByProductIdOrderByDisplayOrderAscIdAsc(id);
        var detail = ProductMapper.toDetail(product, images.findByProductIdOrderByDisplayOrderAscIdAsc(id),
                fonts.findByProductIdOrderByDisplayOrderAscIdAsc(id), engravingPositions);
        var engraving = detail.engraving();
        var effectivePositions = engraving.positions().stream().map(position ->
                new ProductDetailResponse.PositionResponse(position.code(),
                        effectiveMaxChars(engraving.maxChars(), position.maxChars()))).toList();
        return new ProductDetailResponse(detail.id(), detail.categoryId(), detail.code(), detail.slug(),
                detail.name(), detail.shortDescription(), detail.description(), detail.material(),
                detail.price(), detail.stock(), detail.images(),
                new ProductDetailResponse.EngravingResponse(engraving.enabled(), engraving.unitFee(),
                        engraving.maxChars(), engraving.fonts(), effectivePositions));
    }

    private Integer effectiveMaxChars(Integer productLimit, Integer positionLimit) {
        if (positionLimit == null) return productLimit;
        return productLimit == null ? positionLimit : Math.min(productLimit, positionLimit);
    }
}
