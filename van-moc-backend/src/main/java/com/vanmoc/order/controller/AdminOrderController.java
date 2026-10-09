package com.vanmoc.order.controller;
import com.vanmoc.order.service.AdminOrderService;
import com.vanmoc.order.dto.response.*;
import com.vanmoc.order.enums.OrderStatus;
import com.vanmoc.payment.enums.PaymentMethod;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.UUID;
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final AdminOrderService orders;
    public AdminOrderController(AdminOrderService orders) { this.orders=orders; }
    @GetMapping public Page<AdminOrderResponse> list(Authentication auth,
            @RequestParam(defaultValue="") String search, @RequestParam(required=false) OrderStatus status,
            @RequestParam(required=false) PaymentMethod method, @RequestParam(defaultValue="0") int page) {
        return orders.list(AdminIdentity.id(auth),search,status,method,page);
    }
    @GetMapping("/stats") public AdminOrderStatsResponse stats(Authentication auth) {
        return orders.stats(AdminIdentity.id(auth));
    }
    @GetMapping("/{id}") public AdminOrderDetailResponse detail(Authentication auth,@PathVariable UUID id) {
        return orders.detail(AdminIdentity.id(auth),id);
    }
}
