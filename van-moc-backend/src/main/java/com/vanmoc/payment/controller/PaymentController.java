package com.vanmoc.payment.controller;

import com.vanmoc.payment.dto.response.PaymentResponse;
import com.vanmoc.payment.service.PaymentService;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
public class PaymentController {
    private final PaymentService payments;
    public PaymentController(PaymentService payments) { this.payments = payments; }
    @GetMapping("/api/orders/{orderId}/payment")
    public PaymentResponse get(Authentication user, @PathVariable UUID orderId) {
        return payments.get(AdminIdentity.id(user), orderId);
    }
}
