package com.vanmoc.product.dto.request;

import jakarta.validation.constraints.NotNull;

public record AdminCategoryVisibilityRequest(@NotNull Boolean active) {}
