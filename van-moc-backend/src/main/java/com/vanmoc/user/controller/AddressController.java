package com.vanmoc.user.controller;

import com.vanmoc.user.dto.request.AddressRequest;
import com.vanmoc.user.dto.response.AddressResponse;
import com.vanmoc.user.service.AddressService;
import com.vanmoc.user.service.AdminIdentity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addresses;
    public AddressController(AddressService addresses) { this.addresses = addresses; }
    @GetMapping
    public List<AddressResponse> list(Authentication user) {
        return addresses.list(AdminIdentity.id(user));
    }
    @PostMapping
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public AddressResponse create(Authentication user, @Valid @RequestBody AddressRequest request) {
        return addresses.save(AdminIdentity.id(user), null, request);
    }
    @PatchMapping("/{id}")
    public AddressResponse update(Authentication user, @PathVariable UUID id, @Valid @RequestBody AddressRequest request) {
        return addresses.save(AdminIdentity.id(user), id, request);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void delete(Authentication user, @PathVariable UUID id) {
        addresses.delete(AdminIdentity.id(user), id);
    }
}
