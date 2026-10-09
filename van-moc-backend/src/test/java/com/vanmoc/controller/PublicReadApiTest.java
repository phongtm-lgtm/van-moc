package com.vanmoc.controller;

import com.vanmoc.shared.exception.GlobalExceptionHandler;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import com.vanmoc.location.controller.LocationController;
import com.vanmoc.location.service.LocationService;
import com.vanmoc.product.controller.ProductController;
import com.vanmoc.product.service.ProductService;
import com.vanmoc.product.dto.response.ProductPageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.UUID;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PublicReadApiTest {
    private MockMvc mvc;
    private ProductService products;
    @BeforeEach
    void setup() {
        products = mock(ProductService.class);
        var locations = mock(LocationService.class);
        when(products.getProducts(null, 0, 12)).thenReturn(new ProductPageResponse(List.of(), 0, 12, 0, 0));
        when(locations.getWards(999)).thenThrow(new ResourceNotFoundException("PROVINCE_NOT_FOUND"));
        mvc = MockMvcBuilders.standaloneSetup(new ProductController(products), new LocationController(locations))
                .setControllerAdvice(new GlobalExceptionHandler(new StaticMessageSource(), "van-moc-backend")).build();
    }
    @Test
    void returnsStablePageEnvelope() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray()).andExpect(jsonPath("$.size").value(12))
                .andExpect(jsonPath("$.totalPages").value(0));
    }
    @Test
    void rejectsInvalidQueryValues() throws Exception {
        mvc.perform(get("/api/products?size=101")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/products?page=-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/products?categoryId=invalid")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/invalid")).andExpect(status().isBadRequest());
    }
    @Test
    void missingProductReturnsProblemDetail() throws Exception {
        var id = UUID.randomUUID();
        when(products.getProductDetail(id)).thenThrow(new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        mvc.perform(get("/api/products/" + id)).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    }
    @Test
    void missingProvinceReturnsProblemDetail() throws Exception {
        mvc.perform(get("/api/provinces/999/wards")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROVINCE_NOT_FOUND"));
    }
}
