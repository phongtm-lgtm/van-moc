package com.vanmoc.cart.dto.request;

import com.vanmoc.product.enums.EngravingPosition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record CartItemRequest(@NotNull UUID productId, @NotNull @Min(1) @Max(10000) Integer quantity,
        @Valid EngravingRequest engraving) {
    public record EngravingRequest(@NotBlank @Size(max = 2000) String text,
            @NotBlank @Pattern(regexp="[A-Z0-9_]{1,80}") String font, @NotNull EngravingPosition position) {}
}
