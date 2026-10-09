package com.vanmoc.product.dto.response;

import java.util.UUID;

public record CategoryResponse(UUID id, String name, String slug, String description, int displayOrder, boolean active) {}
