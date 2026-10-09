package com.vanmoc.product.dto.response;

import com.vanmoc.product.enums.EngravingPosition;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailResponse(UUID id, UUID categoryId, String code, String slug, String name,
        String shortDescription, String description, String material, BigDecimal price, int stock,
        List<ImageResponse> images, EngravingResponse engraving) {
    public record ImageResponse(UUID id, String url, String altText, boolean primary, int displayOrder, String mediaType) {}
    public record PositionResponse(EngravingPosition code, Integer maxChars) {}
    public record EngravingResponse(boolean enabled, BigDecimal unitFee, Integer maxChars,
                                     List<String> fonts, List<PositionResponse> positions) {}
}
