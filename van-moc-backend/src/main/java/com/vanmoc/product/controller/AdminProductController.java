package com.vanmoc.product.controller;
import com.vanmoc.product.service.AdminProductService;
import com.vanmoc.product.dto.request.AdminProductRequest;
import com.vanmoc.product.dto.response.AdminProductResponse;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import java.util.UUID;
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    private final AdminProductService products;
    public AdminProductController(AdminProductService products){this.products=products;}
    @GetMapping public Page<AdminProductResponse> list(Authentication user,@RequestParam(defaultValue="")String search,
            @RequestParam(required=false)UUID category,@RequestParam(required=false)Boolean active,
            @RequestParam(defaultValue="false")boolean empty,@RequestParam(defaultValue="0")int page){return products.list(AdminIdentity.id(user),search,category,active,empty,page);}
    @GetMapping("/{id}")public AdminProductResponse get(Authentication user,@PathVariable UUID id){return products.get(AdminIdentity.id(user),id);}
    @PostMapping public AdminProductResponse create(Authentication user,@Valid @RequestBody AdminProductRequest r){return products.save(AdminIdentity.id(user),null,r);}
    @PatchMapping("/{id}")public AdminProductResponse update(Authentication user,@PathVariable UUID id,@Valid @RequestBody AdminProductRequest r){return products.save(AdminIdentity.id(user),id,r);}
    @DeleteMapping("/{id}") @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void delete(Authentication user,@PathVariable UUID id,@RequestParam long version){products.delete(AdminIdentity.id(user),id,version);}
}
