package com.vanmoc.order.controller;
import com.vanmoc.order.service.OrderLifecycleService;
import com.vanmoc.order.dto.request.OrderTransitionRequest;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.UUID;
@RestController
public class OrderLifecycleController {
    private final OrderLifecycleService lifecycle;
    public OrderLifecycleController(OrderLifecycleService lifecycle) { this.lifecycle = lifecycle; }
    @PostMapping("/api/orders/{id}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(Authentication user, @PathVariable UUID id) {
        lifecycle.cancel(AdminIdentity.id(user), id);
    }
    @PatchMapping("/api/admin/orders/{id}/status") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void advance(org.springframework.security.core.Authentication user, @PathVariable UUID id,
            @Valid @RequestBody OrderTransitionRequest request) {
        lifecycle.advance(com.vanmoc.user.service.AdminIdentity.id(user), id, request.status(), request.collectCod());
    }
}
