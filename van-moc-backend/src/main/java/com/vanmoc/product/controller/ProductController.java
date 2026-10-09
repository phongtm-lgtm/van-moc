package com.vanmoc.product.controller;

import com.vanmoc.product.service.ProductService;
import com.vanmoc.product.dto.request.ProductListRequest;
import com.vanmoc.product.dto.response.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() { return service.getCategories(); }

    @GetMapping("/products")
    public ProductPageResponse products(@Valid @ModelAttribute ProductListRequest request) {
        return service.getProducts(request.getCategoryId(), request.getPage(), request.getSize());
    }

    @GetMapping("/products/featured")
    public List<ProductResponse> featured() { return service.getFeaturedProducts(); }

    @GetMapping("/products/{id}")
    public ProductDetailResponse detail(@PathVariable UUID id) { return service.getProductDetail(id); }

    @GetMapping("/products/by-slug/{slug}")
    public ProductDetailResponse detailBySlug(@PathVariable String slug) { return service.getProductDetailBySlug(slug); }
}
