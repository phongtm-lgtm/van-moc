package com.vanmoc.product.controller;

import com.vanmoc.product.dto.response.EngravingFontResponse;
import com.vanmoc.product.service.EngravingFontService;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class EngravingFontController {
    private final EngravingFontService service;
    public EngravingFontController(EngravingFontService service) { this.service = service; }

    @GetMapping("/api/engraving-fonts")
    public List<EngravingFontResponse> publicFonts() { return service.publicFonts(); }

    @GetMapping("/api/admin/engraving-fonts")
    public List<EngravingFontResponse> adminFonts(Authentication user) { return service.adminFonts(AdminIdentity.id(user)); }

    @PostMapping("/api/admin/engraving-fonts/google")
    @ResponseStatus(HttpStatus.CREATED)
    public EngravingFontResponse createGoogle(Authentication user, @jakarta.validation.Valid @RequestBody GoogleFont request) {
        return service.createGoogle(AdminIdentity.id(user), request.name(), request.url());
    }

    public record GoogleFont(String name, String url) {}

    @PatchMapping("/api/admin/engraving-fonts/{code}")
    public EngravingFontResponse setActive(Authentication user, @PathVariable String code, @RequestBody Status status) {
        return service.setActive(AdminIdentity.id(user), code, status.active());
    }

    public record Status(boolean active) {}
}
