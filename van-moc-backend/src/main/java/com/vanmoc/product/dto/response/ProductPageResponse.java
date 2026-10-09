package com.vanmoc.product.dto.response;

import java.util.List;

public record ProductPageResponse(List<ProductResponse> content, int page, int size,
                                  long totalElements, long totalPages) {
    public ProductPageResponse { content = List.copyOf(content); }
}
