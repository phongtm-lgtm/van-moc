package com.vanmoc.shipping.dto.response;
import java.math.BigDecimal;
import java.util.List;
public record ShippingRatesResponse(BigDecimal defaultFee, List<ProvinceRate> provinces) {
    public record ProvinceRate(int provinceCode, String provinceName, BigDecimal overrideFee, BigDecimal effectiveFee) {}
}
