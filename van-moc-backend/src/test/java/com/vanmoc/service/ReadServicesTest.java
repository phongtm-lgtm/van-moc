package com.vanmoc.service;

import com.vanmoc.location.repository.*;
import com.vanmoc.location.service.LocationService;
import com.vanmoc.product.repository.*;
import com.vanmoc.product.service.ProductService;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReadServicesTest {
    private final ProductJpaRepository products = mock(ProductJpaRepository.class);
    private final ProductImageJpaRepository images = mock(ProductImageJpaRepository.class);
    private final ProductService service = new ProductService(mock(CategoryJpaRepository.class), products, images,
            mock(ProductEngravingFontJpaRepository.class), mock(ProductEngravingPositionJpaRepository.class));

    @Test
    void missingProvinceMustNotQueryWards() {
        var provinces = mock(ProvinceJpaRepository.class);
        var wards = mock(WardJpaRepository.class);
        var error = assertThrows(ResourceNotFoundException.class,
                () -> new LocationService(provinces, wards).getWards(999));
        assertEquals("PROVINCE_NOT_FOUND", error.getCode());
        verifyNoInteractions(wards);
    }

    @Test
    void wardsAreScopedToProvince() {
        var provinces = mock(ProvinceJpaRepository.class);
        var wards = mock(WardJpaRepository.class);
        when(provinces.existsById(1)).thenReturn(true);
        when(wards.findByProvinceCodeOrderByNameAsc(1)).thenReturn(List.of());
        assertTrue(new LocationService(provinces, wards).getWards(1).isEmpty());
        verify(wards).findByProvinceCodeOrderByNameAsc(1);
    }

    @Test
    void productPagePreservesFilterAndPagination() {
        var id = UUID.randomUUID();
        when(products.findVisible(eq(id), any())).thenReturn(new PageImpl<>(List.of(), PageRequest.of(2, 12), 25));
        var result = service.getProducts(id, 2, 12);
        assertEquals(25, result.totalElements());
        assertEquals(2, result.page());
        assertEquals(3, result.totalPages());
        verify(products).findVisible(eq(id), argThat(page -> page.getPageNumber() == 2 && page.getPageSize() == 12));
    }

    @Test
    void invalidPaginationIsRejectedBeforePersistence() {
        assertThrows(IllegalArgumentException.class, () -> service.getProducts(null, -1, 12));
        assertThrows(IllegalArgumentException.class, () -> service.getProducts(null, 0, 101));
        verifyNoInteractions(products);
    }

    @Test
    void missingProductDoesNotLoadChildren() {
        var id = UUID.randomUUID();
        when(products.findByIdAndActiveTrueAndCategoryActiveTrue(id)).thenReturn(Optional.empty());
        var error = assertThrows(ResourceNotFoundException.class, () -> service.getProductDetail(id));
        assertEquals("PRODUCT_NOT_FOUND", error.getCode());
        verifyNoInteractions(images);
    }
}
