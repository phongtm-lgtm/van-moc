package com.vanmoc.product.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(UUID id, UUID categoryId, String code, String slug, String name,
                              String shortDescription, String material, BigDecimal price,
                               int stock, boolean engravingEnabled, String imageUrl) {}
