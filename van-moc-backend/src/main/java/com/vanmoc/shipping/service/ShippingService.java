package com.vanmoc.shipping.service;

import com.vanmoc.shipping.repository.ShippingRateJpaRepository;
import com.vanmoc.shipping.entity.ShippingRateEntity;
import com.vanmoc.shipping.dto.response.ShippingRatesResponse;
import com.vanmoc.location.repository.ProvinceJpaRepository;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.shared.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ShippingService {
    private final ShippingRateJpaRepository rates;
    private final ProvinceJpaRepository provinces;
    private final UserJpaRepository users;
    public ShippingService(ShippingRateJpaRepository rates, ProvinceJpaRepository provinces, UserJpaRepository users) {
        this.rates = rates; this.provinces = provinces; this.users = users;
    }
    @Transactional(readOnly = true)
    public BigDecimal feeFor(int provinceCode) {
        return rates.findById(provinceCode).or(() -> rates.findById(0)).orElseThrow().getFee();
    }
    @Transactional(readOnly = true)
    public ShippingRatesResponse list(UUID adminId) {
        requireAdmin(adminId);
        var values = new HashMap<Integer, BigDecimal>();
        rates.findAll().forEach(rate -> values.put(rate.getProvinceCode(), rate.getFee()));
        var fallback = values.get(0);
        return new ShippingRatesResponse(fallback, provinces.findAllByOrderByNameAsc().stream()
                .map(p -> new ShippingRatesResponse.ProvinceRate(p.getCode(), p.getName(), values.get(p.getCode()),
                        values.getOrDefault(p.getCode(), fallback))).toList());
    }
    @Transactional
    public void set(UUID adminId, int provinceCode, BigDecimal fee) {
        requireAdmin(adminId);
        validateProvince(provinceCode);
        if (fee == null || fee.signum() < 0 || fee.stripTrailingZeros().scale() > 0
                || fee.compareTo(new BigDecimal("9999999999999")) > 0)
            throw new RuleException("INVALID_SHIPPING_FEE", HttpStatus.BAD_REQUEST);
        var rate = rates.findById(provinceCode).orElseGet(() -> {
            var created = new ShippingRateEntity(); created.setProvinceCode(provinceCode); return created;
        });
        rate.setFee(fee); rates.saveAndFlush(rate);
    }
    @Transactional
    public void reset(UUID adminId, int provinceCode) {
        requireAdmin(adminId);
        if (provinceCode == 0) throw new RuleException("DEFAULT_SHIPPING_REQUIRED", HttpStatus.BAD_REQUEST);
        validateProvince(provinceCode);
        rates.findById(provinceCode).ifPresent(rates::delete);
    }
    private void validateProvince(int code) {
        if (code < 0 || code != 0 && !provinces.existsById(code))
            throw new ResourceNotFoundException("PROVINCE_NOT_FOUND");
    }
    private void requireAdmin(UUID id) {
        users.findById(id).filter(u -> u.isActive() && u.getRole() == UserRole.ADMIN)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Admin required"));
    }
}
