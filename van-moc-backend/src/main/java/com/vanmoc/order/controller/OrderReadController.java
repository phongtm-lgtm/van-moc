package com.vanmoc.order.controller;
import com.vanmoc.order.dto.response.*;
import com.vanmoc.order.service.OrderReadService;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.UUID;
@RestController
@RequestMapping("/api/orders")
public class OrderReadController {
    private final OrderReadService orders;
    public OrderReadController(OrderReadService orders) { this.orders = orders; }
    @GetMapping public Page<CheckoutResponse> list(Authentication user,
            @RequestParam(defaultValue = "0") int page) {
        return orders.list(AdminIdentity.id(user), page);
    }
    @GetMapping("/{id}") public OrderDetailResponse detail(Authentication user, @PathVariable UUID id) {
        return orders.detail(AdminIdentity.id(user), id);
    }
}
