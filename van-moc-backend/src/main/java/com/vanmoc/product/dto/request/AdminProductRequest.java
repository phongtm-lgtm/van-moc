package com.vanmoc.product.dto.request;
import com.vanmoc.product.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
public record AdminProductRequest(@NotNull UUID categoryId,
        @NotBlank @Size(max=255) String code, @NotBlank @Size(max=255) @Pattern(regexp="[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
        @NotBlank @Size(max=255) String name, @Size(max=2000) String shortDescription,
        @Size(max=20000) String description, @NotBlank @Size(max=255) String material,
        @NotNull @DecimalMin("0") @Digits(integer=13,fraction=0) BigDecimal price,
        boolean active, boolean engravingEnabled, @Min(1) @Max(255) Integer engravingMaxChars,
        @NotNull @DecimalMin("0") @Digits(integer=13,fraction=0) BigDecimal engravingFee,
        @NotNull @Size(max=20) List<@NotBlank @Pattern(regexp="[A-Z0-9_]{1,80}") String> fonts,
        @NotNull @Size(max=20) List<@Valid Position> positions, @NotNull Long version) {
    public record Position(@NotNull EngravingPosition position, @Min(1) @Max(255) Integer maxChars) {}
}
