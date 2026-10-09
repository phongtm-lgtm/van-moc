package com.vanmoc.shipping.dto.response;

import java.math.BigDecimal;

public record ShippingQuoteResponse(int provinceCode, BigDecimal fee) {}
