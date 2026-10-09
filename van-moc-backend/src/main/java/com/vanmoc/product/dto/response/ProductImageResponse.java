package com.vanmoc.product.dto.response;

import java.util.UUID;

public record ProductImageResponse(UUID id, String url, String altText, boolean primary, int displayOrder, String mediaType) {}
