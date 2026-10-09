package com.vanmoc.order.controller;
import com.vanmoc.order.dto.request.CheckoutRequest;
import com.vanmoc.order.dto.response.CheckoutResponse;
import com.vanmoc.order.service.CheckoutService;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutService checkout;
    public CheckoutController(CheckoutService checkout){this.checkout=checkout;}
    @PostMapping("/preview") public CheckoutResponse preview(Authentication user,@Valid @RequestBody CheckoutRequest request){return checkout.checkout(AdminIdentity.id(user),request,false);}
    @PostMapping public CheckoutResponse create(Authentication user,@Valid @RequestBody CheckoutRequest request){return checkout.checkout(AdminIdentity.id(user),request,true);}
}
