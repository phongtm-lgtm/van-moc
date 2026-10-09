package com.vanmoc.cart.dto.response;

import com.vanmoc.product.dto.Engraving;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(List<Item> items, BigDecimal productSubtotal, BigDecimal engravingTotal, BigDecimal total) {
    public record Item(UUID id, UUID productId, String productSlug, String productName, String imageUrl, int stock, boolean available,
            int quantity, Engraving engraving, BigDecimal unitPrice, BigDecimal engravingUnitFee, BigDecimal lineTotal) {}
}
