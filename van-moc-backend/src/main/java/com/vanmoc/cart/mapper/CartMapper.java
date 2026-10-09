package com.vanmoc.cart.mapper;

import com.vanmoc.cart.dto.response.CartResponse;
import com.vanmoc.cart.entity.CartItemEntity;
import com.vanmoc.product.dto.Engraving;
import java.math.BigDecimal;

public final class CartMapper {
    private CartMapper() {}
    public static Engraving engraving(CartItemEntity item) {
        return item.getEngravingText() == null ? null : new Engraving(item.getEngravingText(), item.getEngravingFont(), item.getEngravingPosition());
    }
    public static CartResponse.Item toResponse(CartItemEntity item, String image, boolean available) {
        var product = item.getProduct();
        var fee = item.getEngravingText() == null ? BigDecimal.ZERO : product.getEngravingFee();
        return new CartResponse.Item(item.getId(), product.getId(), product.getSlug(), product.getName(), image, product.getStock(), available,
                item.getQuantity(), engraving(item), product.getPrice(), fee,
                product.getPrice().add(fee).multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}
