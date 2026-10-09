package com.vanmoc.shipping.service;

import com.vanmoc.location.repository.ProvinceJpaRepository;
import com.vanmoc.shipping.entity.ShippingRateEntity;
import com.vanmoc.shipping.repository.ShippingRateJpaRepository;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ShippingServiceTest {
    private final ShippingRateJpaRepository rates = mock(ShippingRateJpaRepository.class);
    private final ProvinceJpaRepository provinces = mock(ProvinceJpaRepository.class);
    private final ShippingService service = new ShippingService(rates, provinces, mock(UserJpaRepository.class));

    @Test
    void quoteUsesConfiguredProvinceRate() {
        when(provinces.existsById(1)).thenReturn(true);
        var rate = new ShippingRateEntity(); rate.setFee(new BigDecimal("25000"));
        when(rates.findById(1)).thenReturn(Optional.of(rate));
        var quote = service.quote(1);
        assertEquals(1, quote.provinceCode());
        assertEquals(new BigDecimal("25000"), quote.fee());
        verify(rates, never()).findById(0);
    }

    @Test
    void quoteFallsBackToDefaultRate() {
        when(provinces.existsById(1)).thenReturn(true);
        when(rates.findById(1)).thenReturn(Optional.empty());
        var rate = new ShippingRateEntity(); rate.setFee(new BigDecimal("30000"));
        when(rates.findById(0)).thenReturn(Optional.of(rate));
        assertEquals(new BigDecimal("30000"), service.quote(1).fee());
    }

    @Test
    void quoteRejectsUnknownAndNonPositiveProvinces() {
        assertThrows(ResourceNotFoundException.class, () -> service.quote(999));
        assertThrows(ResourceNotFoundException.class, () -> service.quote(0));
        assertThrows(ResourceNotFoundException.class, () -> service.quote(-1));
        verifyNoInteractions(rates);
    }
}
