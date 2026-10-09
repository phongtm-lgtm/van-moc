package com.vanmoc.product.dto.response;
import com.vanmoc.product.dto.request.AdminProductRequest;
import java.util.UUID;
import java.util.List;
public record AdminProductResponse(UUID id, int stock, AdminProductRequest details, List<ProductImageResponse> images) {}
