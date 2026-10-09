package com.vanmoc.cart.service;

import com.vanmoc.cart.dto.request.*;
import com.vanmoc.cart.dto.response.CartResponse;
import com.vanmoc.cart.entity.*;
import com.vanmoc.cart.mapper.CartMapper;
import com.vanmoc.cart.repository.*;
import com.vanmoc.product.dto.Engraving;
import com.vanmoc.product.repository.*;
import com.vanmoc.product.service.EngravingService;
import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.shared.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class CartService {
    private final UserJpaRepository users;
    private final CartJpaRepository carts;
    private final CartItemJpaRepository items;
    private final ProductJpaRepository products;
    private final ProductImageJpaRepository images;
    private final EngravingService engraving;
    public CartService(UserJpaRepository users, CartJpaRepository carts, CartItemJpaRepository items,
            ProductJpaRepository products, ProductImageJpaRepository images, EngravingService engraving) {
        this.users = users; this.carts = carts; this.items = items; this.products = products; this.images = images; this.engraving = engraving;
    }
    private UserEntity owner(UUID id) {
        return users.lockById(id).filter(UserEntity::isActive).orElseThrow(() -> new AccessDeniedException("Account unavailable"));
    }
    private CartEntity cart(UserEntity user) {
        return carts.findByUserId(user.getId()).orElseGet(() -> { var cart = new CartEntity(); cart.setUser(user); return carts.saveAndFlush(cart); });
    }
    public CartResponse get(UUID userId) { return response(cart(owner(userId))); }
    public CartResponse add(UUID userId, CartItemRequest request) {
        var cart = cart(owner(userId));
        var product = products.findByIdAndActiveTrueAndCategoryActiveTrue(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        var config = engraving.validate(product, toEngraving(request.engraving()));
        var rows = items.findByCartIdOrderByCreatedAtAscIdAsc(cart.getId());
        var target = rows.stream().filter(i -> i.getProduct().getId().equals(product.getId()) && Objects.equals(CartMapper.engraving(i), config)).findFirst().orElse(null);
        if (request.quantity() == null || request.quantity() < 1 || request.quantity() > 10000) throw new RuleException("INVALID_QUANTITY", HttpStatus.BAD_REQUEST);
        int total = rows.stream().filter(i -> i.getProduct().getId().equals(product.getId())).mapToInt(CartItemEntity::getQuantity).sum();
        if ((long) total + request.quantity() > product.getStock()) throw new RuleException("INSUFFICIENT_STOCK", HttpStatus.CONFLICT);
        if (target == null) { target = new CartItemEntity(); target.setCart(cart); target.setProduct(product); setEngraving(target, config); }
        target.setQuantity(target.getQuantity() + request.quantity()); items.saveAndFlush(target);
        return response(cart);
    }
    public CartResponse update(UUID userId, UUID itemId, CartItemUpdateRequest request) {
        var cart = cart(owner(userId));
        var rows = items.findByCartIdOrderByCreatedAtAscIdAsc(cart.getId());
        var target = rows.stream().filter(i -> i.getId().equals(itemId)).findFirst().orElseThrow(() -> new ResourceNotFoundException("CART_ITEM_NOT_FOUND"));
        var product = products.findByIdAndActiveTrueAndCategoryActiveTrue(target.getProduct().getId()).orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        var config = engraving.validate(product, toEngraving(request.engraving()));
        if (request.quantity() == null || request.quantity() < 1 || request.quantity() > 10000) throw new RuleException("INVALID_QUANTITY", HttpStatus.BAD_REQUEST);
        int others = rows.stream().filter(i -> !i.getId().equals(itemId) && i.getProduct().getId().equals(product.getId())).mapToInt(CartItemEntity::getQuantity).sum();
        if ((long) others + request.quantity() > product.getStock()) throw new RuleException("INSUFFICIENT_STOCK", HttpStatus.CONFLICT);
        var duplicate = rows.stream().filter(i -> !i.getId().equals(itemId) && i.getProduct().getId().equals(product.getId()) && Objects.equals(CartMapper.engraving(i), config)).findFirst();
        if (duplicate.isPresent()) { var existing = duplicate.get(); existing.setQuantity(existing.getQuantity() + request.quantity()); items.delete(target); }
        else { target.setQuantity(request.quantity()); setEngraving(target, config); }
        items.flush(); return response(cart);
    }
    public CartResponse delete(UUID userId, UUID itemId) {
        var cart = cart(owner(userId));
        var rows = items.findByCartIdOrderByCreatedAtAscIdAsc(cart.getId());
        if (itemId == null) items.deleteAll(rows);
        else items.delete(rows.stream().filter(i -> i.getId().equals(itemId)).findFirst().orElseThrow(() -> new ResourceNotFoundException("CART_ITEM_NOT_FOUND")));
        items.flush(); return response(cart);
    }
    private Engraving toEngraving(CartItemRequest.EngravingRequest config) {
        return config == null ? null : new Engraving(config.text(), config.font(), config.position());
    }
    private void setEngraving(CartItemEntity target, Engraving config) {
        target.setEngravingText(config == null ? null : config.text()); target.setEngravingFont(config == null ? null : config.font()); target.setEngravingPosition(config == null ? null : config.position());
    }
    private CartResponse response(CartEntity cart) {
        var rows = items.findByCartIdOrderByCreatedAtAscIdAsc(cart.getId());
        var urls = new HashMap<UUID, String>();
        if (!rows.isEmpty()) for (var image : images.findListImages(rows.stream().map(i -> i.getProduct().getId()).distinct().toList())) {
            if (!urls.containsKey(image.getProductId())) urls.put(image.getProductId(), image.getImageUrl());
        }
        var result = rows.stream().map(item -> {
            var product = item.getProduct();
            boolean available = product.isActive() && product.getCategory().isActive();
            try { engraving.validate(product, CartMapper.engraving(item)); } catch (RuleException exception) { available = false; }
            return CartMapper.toResponse(item, urls.get(product.getId()), available);
        }).toList();
        BigDecimal subtotal = BigDecimal.ZERO, fees = BigDecimal.ZERO;
        for (var item : result) { subtotal = subtotal.add(item.unitPrice().multiply(BigDecimal.valueOf(item.quantity()))); fees = fees.add(item.engravingUnitFee().multiply(BigDecimal.valueOf(item.quantity()))); }
        return new CartResponse(result, subtotal, fees, subtotal.add(fees));
    }
}
