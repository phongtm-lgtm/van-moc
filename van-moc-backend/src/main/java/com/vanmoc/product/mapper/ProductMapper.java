package com.vanmoc.product.mapper;

import com.vanmoc.product.dto.response.*;
import com.vanmoc.product.entity.*;
import java.math.BigDecimal;
import java.util.List;

public final class ProductMapper {
    private ProductMapper() {}

    public static ProductImageResponse toImageResponse(ProductImageEntity image) {
        return new ProductImageResponse(image.getId(), image.getImageUrl(), image.getAltText(),
                image.isPrimaryImage(), image.getDisplayOrder(), image.getMediaType());
    }

    public static CategoryResponse toResponse(CategoryEntity category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug(),
                category.getDescription(), category.getDisplayOrder(), category.isActive());
    }

    public static ProductResponse toResponse(ProductEntity product, String imageUrl) {
        return new ProductResponse(product.getId(), product.getCategory().getId(), product.getCode(),
                product.getSlug(), product.getName(), product.getShortDescription(), product.getMaterial(),
                product.getPrice(), product.getStock(), product.isEngravingEnabled(), imageUrl);
    }

    public static ProductDetailResponse toDetail(ProductEntity product, List<ProductImageEntity> images,
            List<ProductEngravingFontEntity> fonts, List<ProductEngravingPositionEntity> positions) {
        var imageResponses = images.stream().map(image -> new ProductDetailResponse.ImageResponse(
                image.getId(), image.getImageUrl(), image.getAltText(), image.isPrimaryImage(),
                image.getDisplayOrder(), image.getMediaType())).toList();
        var fontResponses = product.isEngravingEnabled() ? fonts.stream().map(ProductEngravingFontEntity::getFont)
                .toList() : List.<String>of();
        var positionResponses = product.isEngravingEnabled() ? positions.stream().map(position ->
                new ProductDetailResponse.PositionResponse(position.getPosition(), position.getMaxChars())).toList()
                : List.<ProductDetailResponse.PositionResponse>of();
        return new ProductDetailResponse(product.getId(), product.getCategory().getId(), product.getCode(),
                product.getSlug(), product.getName(), product.getShortDescription(), product.getDescription(),
                product.getMaterial(), product.getPrice(), product.getStock(), imageResponses,
                new ProductDetailResponse.EngravingResponse(product.isEngravingEnabled(),
                        product.isEngravingEnabled() ? product.getEngravingFee() : BigDecimal.ZERO,
                        product.isEngravingEnabled() ? product.getEngravingMaxChars() : null,
                        fontResponses, positionResponses));
    }
}
