package com.vanmoc.shipping.controller;

import com.vanmoc.shipping.service.ShippingService;
import com.vanmoc.shipping.dto.response.ShippingQuoteResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {
    private final ShippingService shipping;
    public ShippingController(ShippingService shipping) { this.shipping = shipping; }

    @GetMapping("/quote")
    public ShippingQuoteResponse quote(@RequestParam int provinceCode) {
        return shipping.quote(provinceCode);
    }
}
