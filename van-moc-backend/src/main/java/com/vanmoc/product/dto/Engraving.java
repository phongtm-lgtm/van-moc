package com.vanmoc.product.dto;

import com.vanmoc.product.enums.EngravingPosition;

/** Personalization of an existing product, not a custom manufacturing request. */
public record Engraving(String text, String font, EngravingPosition position) {
}
