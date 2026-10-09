package com.vanmoc.shipping.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record ShippingRateRequest(@NotNull @DecimalMin("0") @Digits(integer = 13, fraction = 0) BigDecimal fee) {}
