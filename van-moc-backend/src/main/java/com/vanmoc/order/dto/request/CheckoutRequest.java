package com.vanmoc.order.dto.request;

import com.vanmoc.payment.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record CheckoutRequest(@NotEmpty @Size(max=100) List<@NotNull UUID> cartItemIds,
        @NotNull UUID addressId, @NotNull PaymentMethod paymentMethod,
        @Size(max=2000) String note, @NotBlank @Size(max=100) String idempotencyKey) {}
