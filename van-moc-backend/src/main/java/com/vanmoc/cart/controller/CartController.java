package com.vanmoc.cart.controller;

import com.vanmoc.cart.dto.request.*;
import com.vanmoc.cart.dto.response.CartResponse;
import com.vanmoc.cart.service.CartService;
import com.vanmoc.user.service.AdminIdentity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cart;
    public CartController(CartService cart) { this.cart = cart; }
    @GetMapping public CartResponse get(Authentication user) { return cart.get(AdminIdentity.id(user)); }
    @PostMapping("/items") public CartResponse add(Authentication user, @Valid @RequestBody CartItemRequest request) { return cart.add(AdminIdentity.id(user), request); }
    @PatchMapping("/items/{id}") public CartResponse update(Authentication user, @PathVariable UUID id, @Valid @RequestBody CartItemUpdateRequest request) { return cart.update(AdminIdentity.id(user), id, request); }
    @DeleteMapping("/items/{id}") public CartResponse delete(Authentication user, @PathVariable UUID id) { return cart.delete(AdminIdentity.id(user), id); }
    @DeleteMapping("/items") public CartResponse clear(Authentication user) { return cart.delete(AdminIdentity.id(user), null); }
}
