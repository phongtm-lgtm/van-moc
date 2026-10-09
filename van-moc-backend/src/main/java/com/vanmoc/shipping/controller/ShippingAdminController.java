package com.vanmoc.shipping.controller;
import com.vanmoc.shipping.service.ShippingService;
import com.vanmoc.shipping.dto.request.ShippingRateRequest;
import com.vanmoc.shipping.dto.response.ShippingRatesResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/admin/shipping")
public class ShippingAdminController {
    private final ShippingService shipping;
    public ShippingAdminController(ShippingService shipping) { this.shipping = shipping; }
    @GetMapping public ShippingRatesResponse list(org.springframework.security.core.Authentication user) {
        return shipping.list(com.vanmoc.user.service.AdminIdentity.id(user));
    }
    @PatchMapping("/{provinceCode}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void set(org.springframework.security.core.Authentication user, @PathVariable int provinceCode,
            @Valid @RequestBody ShippingRateRequest request) {
        shipping.set(com.vanmoc.user.service.AdminIdentity.id(user), provinceCode, request.fee());
    }
    @DeleteMapping("/{provinceCode}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset(org.springframework.security.core.Authentication user, @PathVariable int provinceCode) {
        shipping.reset(com.vanmoc.user.service.AdminIdentity.id(user), provinceCode);
    }
}
