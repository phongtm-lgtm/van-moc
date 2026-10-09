package com.vanmoc.cart.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CartItemUpdateRequest(@NotNull @Min(1) @Max(10000) Integer quantity,
        @Valid CartItemRequest.EngravingRequest engraving) {}
