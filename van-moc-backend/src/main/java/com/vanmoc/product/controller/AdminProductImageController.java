package com.vanmoc.product.controller;

import com.vanmoc.product.dto.response.ProductImageResponse;
import com.vanmoc.product.service.ProductImageService;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products/{productId}/images")
public class AdminProductImageController {
    private final ProductImageService images;

    public AdminProductImageController(ProductImageService images) {
        this.images = images;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse upload(Authentication user, @PathVariable UUID productId,
            @RequestParam("file") MultipartFile file) {
        return images.upload(AdminIdentity.id(user), productId, file);
    }

    @PatchMapping("/{imageId}/primary")
    public ProductImageResponse setPrimary(Authentication user, @PathVariable UUID productId,
            @PathVariable UUID imageId) {
        return images.setPrimary(AdminIdentity.id(user), productId, imageId);
    }
}
